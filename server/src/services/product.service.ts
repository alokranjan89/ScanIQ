import {
    Prisma,
} from "../generated/prisma/client.js";

import {
    findProductByBarcode,
    createProduct,
    updateProduct as updateProductRepository,
    refreshProductData,
} from "../repositories/product.repository.js";

import {
    getJsonCache,
    setJsonCache,
    deleteCache,
} from "./redis.service.js";

import { productCacheKey } from "../utils/cache-key.js";
import { UPCItemDBProvider } from "./upcitemdb.provider.js";
import { OpenFoodFactsProvider } from "./openfoodfacts.provider.js";
import { normalizeProduct } from "./product.normalizer.js";
import { AppError } from "../utils/app-error.js";
import { CACHE_TTL } from "../config/cache.js";

import type {
    ExternalProduct,
} from "./product-provider.service.js";


/*
 * ---------------------------------------------------------
 * PROVIDERS
 * ---------------------------------------------------------
 */

const generalProvider =
    new UPCItemDBProvider();

const foodProvider =
    new OpenFoodFactsProvider();


/*
 * ---------------------------------------------------------
 * DEPENDENCIES
 * ---------------------------------------------------------
 *
 * Keeping dependencies together makes the service easier
 * to test and allows providers/repositories to be replaced
 * with mocks later.
 */

export const productServiceDependencies = {
    findProductByBarcode,
    createProduct,
    updateProductRepository,
    refreshProductData,

    getJsonCache,
    setJsonCache,
    deleteCache,

    generalProvider,
    foodProvider,
};


/*
 * ---------------------------------------------------------
 * FOOD PRODUCT DETECTION
 * ---------------------------------------------------------
 */

const isFoodProduct = (
    category?: string
): boolean => {

    if (!category) {
        return false;
    }

    const value =
        category.toLowerCase();

    const foodKeywords = [
        "food",
        "beverage",
        "grocery",
        "drink",
        "snack",
        "tobacco",
    ];

    return foodKeywords.some(
        (keyword) =>
            value.includes(keyword)
    );
};


/*
 * ---------------------------------------------------------
 * SOURCE NORMALIZATION
 * ---------------------------------------------------------
 *
 * Build a unique list of provider sources.
 *
 * Providers can sometimes return the same provider more
 * than once during enrichment. We deduplicate them here.
 *
 * rawData MUST be preserved because the verification
 * service uses original provider responses as evidence.
 */

const buildSourceEntries = (
    products: Array<{
        source?: string;
        sourceUrl?: string;

        sources?: Array<{
            provider: string;
            sourceUrl?: string;
            rawData?: Prisma.InputJsonValue;
            isPrimary?: boolean;
        }>;
    }>
) => {

    const byProvider =
        new Map<
            string,
            {
                provider: string;
                sourceUrl?: string;
                rawData?: Prisma.InputJsonValue;
                isPrimary: boolean;
            }
        >();


    for (const product of products) {

        const entries =
            product.sources ??
            (
                product.source
                    ? [
                        {
                            provider:
                                product.source,

                            sourceUrl:
                                product.sourceUrl,

                            isPrimary: true,
                        },
                    ]
                    : []
            );


        for (const entry of entries) {

            if (!entry.provider) {
                continue;
            }


            const normalizedProvider =
                entry.provider.trim();


            const normalizedUrl =
                entry.sourceUrl?.trim();


            if (!normalizedProvider) {
                continue;
            }


            const previous =
                byProvider.get(
                    normalizedProvider
                );


            /*
             * First source from this provider.
             */
            if (!previous) {

                byProvider.set(
                    normalizedProvider,
                    {
                        provider:
                            normalizedProvider,

                        sourceUrl:
                            normalizedUrl,

                        rawData:
                            entry.rawData,

                        isPrimary:
                            Boolean(
                                entry.isPrimary
                            ),
                    }
                );

                continue;
            }


            /*
             * Preserve a source URL if the
             * previous entry didn't have one.
             */
            if (
                !previous.sourceUrl &&
                normalizedUrl
            ) {
                previous.sourceUrl =
                    normalizedUrl;
            }


            /*
             * Preserve raw provider response.
             *
             * If the first entry did not have
             * rawData but a later entry does,
             * keep the later rawData.
             */
            if (
                !previous.rawData &&
                entry.rawData
            ) {
                previous.rawData =
                    entry.rawData;
            }


            /*
             * Once a provider is primary,
             * keep it primary.
             */
            previous.isPrimary =
                previous.isPrimary ||
                Boolean(
                    entry.isPrimary
                );
        }
    }


    return [
        ...byProvider.values(),
    ];
};


/*
 * ---------------------------------------------------------
 * FETCH FRESH PRODUCT
 * ---------------------------------------------------------
 *
 * Provider strategy:
 *
 * 1. UPCitemdb
 * 2. Open Food Facts fallback
 * 3. Optional food enrichment
 * 4. Normalize
 * 5. PostgreSQL
 * 6. Redis
 *
 * IMPORTANT:
 *
 * Open Food Facts is called at most once per request.
 */

export const fetchFreshProduct = async (
    barcode: string
) => {

    let externalProduct:
        ExternalProduct | null = null;


    /*
     * Keep the Open Food Facts result.
     *
     * This prevents the same request from calling
     * Open Food Facts twice.
     */
    let foodProduct:
        ExternalProduct | null = null;


    /*
     * Track provider failures separately.
     *
     * A failed UPCitemdb request should NOT make
     * the whole request fail if Open Food Facts
     * successfully returns the product.
     */
    let generalProviderFailed =
        false;

    let foodProviderFailed =
        false;


    const sourceProducts: Array<{
        source?: string;
        sourceUrl?: string;

        sources?: Array<{
            provider: string;
            sourceUrl?: string;
            rawData?: Prisma.InputJsonValue;
            isPrimary?: boolean;
        }>;
    }> = [];


    /*
     * -----------------------------------------------------
     * 1. TRY PRIMARY / GENERAL PROVIDER
     * -----------------------------------------------------
     */

    try {

        externalProduct =
            await productServiceDependencies
                .generalProvider
                .getProductByBarcode(
                    barcode
                );


        if (externalProduct) {

            sourceProducts.push(
                externalProduct
            );
        }

    } catch (error) {

        generalProviderFailed =
            true;


        console.error(
            "UPCitemdb provider failed:",

            error instanceof Error
                ? error.message
                : "Unknown error"
        );
    }


    /*
     * -----------------------------------------------------
     * 2. FALLBACK TO OPEN FOOD FACTS
     * -----------------------------------------------------
     *
     * If UPCitemdb did not return a product,
     * Open Food Facts becomes the fallback.
     *
     * We store the result in foodProduct so that
     * the enrichment stage does NOT call it again.
     */

    if (!externalProduct) {

        try {

            foodProduct =
                await productServiceDependencies
                    .foodProvider
                    .getProductByBarcode(
                        barcode
                    );


            externalProduct =
                foodProduct;


            if (foodProduct) {

                sourceProducts.push(
                    foodProduct
                );
            }

        } catch (error) {

            foodProviderFailed =
                true;


            console.error(
                "Open Food Facts fallback failed:",

                error instanceof Error
                    ? error.message
                    : "Unknown error"
            );
        }
    }


    /*
     * -----------------------------------------------------
     * 3. BOTH PROVIDERS FAILED
     * -----------------------------------------------------
     *
     * Only return EXTERNAL_API_FAILURE when no provider
     * was able to provide usable product data.
     */

    if (
        !externalProduct &&
        (
            generalProviderFailed ||
            foodProviderFailed
        )
    ) {

        throw new AppError(
            503,
            "EXTERNAL_API_FAILURE",
            "Product providers temporarily unavailable"
        );
    }


    /*
     * -----------------------------------------------------
     * 4. NO PRODUCT FOUND
     * -----------------------------------------------------
     *
     * Providers responded successfully but no product
     * exists for this barcode.
     */

    if (!externalProduct) {

        await productServiceDependencies
            .setJsonCache(
                productCacheKey(
                    barcode
                ),
                null,
                CACHE_TTL.PRODUCT_NOT_FOUND
            );


        return null;
    }


    /*
     * -----------------------------------------------------
     * 5. FOOD ENRICHMENT
     * -----------------------------------------------------
     *
     * If the primary provider gave us a food/beverage
     * product, Open Food Facts can provide additional
     * ingredients/nutrition information.
     *
     * BUT:
     *
     * If Open Food Facts was already called during
     * fallback, reuse that result.
     */

    let enrichedProduct =
        externalProduct;


    if (
        isFoodProduct(
            enrichedProduct.category
        )
    ) {

        try {

            /*
             * Only call Open Food Facts if we
             * haven't already called it.
             */
            if (!foodProduct) {

                foodProduct =
                    await productServiceDependencies
                        .foodProvider
                        .getProductByBarcode(
                            barcode
                        );
            }


            if (foodProduct) {

                /*
                 * Add provider data.
                 *
                 * buildSourceEntries() will
                 * deduplicate the provider.
                 */
                sourceProducts.push(
                    foodProduct
                );


                enrichedProduct = {
                    ...enrichedProduct,


                    /*
                     * Prefer Open Food Facts
                     * ingredients when available.
                     */
                    ingredients:
                        foodProduct.ingredients ??
                        enrichedProduct.ingredients,


                    /*
                     * Merge attributes from both
                     * providers.
                     */
                    attributes: {
                        ...enrichedProduct.attributes,
                        ...foodProduct.attributes,
                    },


                    /*
                     * Prefer Open Food Facts
                     * nutrition when available.
                     */
                    nutrition:
                        foodProduct.nutrition ??
                        enrichedProduct.nutrition,


                    /*
                     * Keep primary provider identity.
                     */
                    source:
                        enrichedProduct.source,


                    sourceUrl:
                        enrichedProduct.sourceUrl,


                    /*
                     * Build deduplicated source list.
                     */
                    sources:
                        buildSourceEntries([
                            enrichedProduct,
                            foodProduct,
                        ]),
                };
            }

        } catch (error) {

            /*
             * Food enrichment is optional.
             *
             * If it fails, we still keep the
             * primary provider's product data.
             */

            console.error(
                "Food provider enrichment failed:",

                error instanceof Error
                    ? error.message
                    : "Unknown error"
            );
        }
    }


    /*
     * -----------------------------------------------------
     * 6. BUILD SOURCE / PROVENANCE
     * -----------------------------------------------------
     *
     * The first provider is treated as primary.
     *
     * rawData is preserved.
     */

    const normalizedSources =
        buildSourceEntries(
            sourceProducts
        ).map(
            (source, index) => ({
                ...source,

                isPrimary:
                    index === 0,
            })
        );


    /*
     * -----------------------------------------------------
     * 7. NORMALIZE EXTERNAL DATA
     * -----------------------------------------------------
     */

    const normalizedProduct =
        normalizeProduct({
            ...enrichedProduct,

            sources:
                normalizedSources,
        });


    /*
     * -----------------------------------------------------
     * 8. CHECK POSTGRESQL
     * -----------------------------------------------------
     */

    const existingProduct =
        await productServiceDependencies
            .findProductByBarcode(
                barcode
            );


    let savedProduct;


    /*
     * -----------------------------------------------------
     * 9. EXISTING PRODUCT
     * -----------------------------------------------------
     *
     * Refresh provider-backed information.
     */

    if (existingProduct) {

        savedProduct =
            await productServiceDependencies
                .refreshProductData(
                    existingProduct.id,
                    {
                        name:
                            normalizedProduct.name,

                        brand:
                            normalizedProduct.brand,

                        category:
                            normalizedProduct.category,

                        description:
                            normalizedProduct.description,

                        imageUrl:
                            normalizedProduct.imageUrl,

                        manufacturer:
                            normalizedProduct.manufacturer,

                        country:
                            normalizedProduct.country,

                        attributes:
                            normalizedProduct.attributes,

                        ingredients:
                            normalizedProduct.ingredients,

                        prices:
                            normalizedProduct.prices,

                        nutrition:
                            normalizedProduct.nutrition,

                        sources:
                            normalizedProduct.sources,
                    }
                );
    }


    /*
     * -----------------------------------------------------
     * 10. NEW PRODUCT
     * -----------------------------------------------------
     */

    else {

        try {

            savedProduct =
                await productServiceDependencies
                    .createProduct({
                        barcode:
                            normalizedProduct.barcode,

                        name:
                            normalizedProduct.name,

                        brand:
                            normalizedProduct.brand,

                        category:
                            normalizedProduct.category,

                        description:
                            normalizedProduct.description,

                        imageUrl:
                            normalizedProduct.imageUrl,

                        manufacturer:
                            normalizedProduct.manufacturer,

                        country:
                            normalizedProduct.country,

                        attributes:
                            normalizedProduct.attributes,

                        prices:
                            normalizedProduct.prices,

                        ingredients:
                            normalizedProduct.ingredients,

                        nutrition:
                            normalizedProduct.nutrition,

                        source:
                            normalizedProduct.source,

                        sourceUrl:
                            normalizedProduct.sourceUrl,

                        sources:
                            normalizedProduct.sources,
                    });

        } catch (error) {

            /*
             * Two requests may discover
             * the same new barcode at the
             * same time.
             *
             * PostgreSQL protects the
             * unique barcode constraint.
             *
             * If another request created
             * the product first, retrieve
             * that product instead of
             * failing the API request.
             */

            if (
                error instanceof
                    Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {

                const concurrentProduct =
                    await productServiceDependencies
                        .findProductByBarcode(
                            barcode
                        );


                if (!concurrentProduct) {
                    throw error;
                }


                savedProduct =
                    concurrentProduct;

            } else {

                throw error;
            }
        }
    }


    /*
     * -----------------------------------------------------
     * 11. CACHE FINAL PRODUCT
     * -----------------------------------------------------
     */

    await productServiceDependencies
        .setJsonCache(
            productCacheKey(
                barcode
            ),
            savedProduct,
            CACHE_TTL.PRODUCT
        );


    return savedProduct;
};


/*
 * ---------------------------------------------------------
 * GET PRODUCT BY BARCODE
 * ---------------------------------------------------------
 *
 * Lookup order:
 *
 * Redis
 *   ↓
 * PostgreSQL
 *   ↓
 * External providers
 */

export const getProductByBarcode = async (
    barcode: string
) => {

    /*
     * -----------------------------------------------------
     * 1. REDIS
     * -----------------------------------------------------
     */

    const cacheKey =
        productCacheKey(
            barcode
        );


    const cachedProduct =
        await productServiceDependencies
            .getJsonCache(
                cacheKey
            );


    if (cachedProduct.hit) {

        return cachedProduct.value;
    }


    /*
     * -----------------------------------------------------
     * 2. POSTGRESQL
     * -----------------------------------------------------
     */

    const existingProduct =
        await productServiceDependencies
            .findProductByBarcode(
                barcode
            );


    if (existingProduct) {

        /*
         * Warm Redis cache.
         */

        await productServiceDependencies
            .setJsonCache(
                cacheKey,
                existingProduct,
                CACHE_TTL.PRODUCT
            );


        return existingProduct;
    }


    /*
     * -----------------------------------------------------
     * 3. EXTERNAL PROVIDERS
     * -----------------------------------------------------
     */

    try {

        return await fetchFreshProduct(
            barcode
        );

    } catch (error) {

        console.error(
            "Product fetch failed:",

            error instanceof Error
                ? error.message
                : "Unknown error"
        );


        /*
         * Never expose raw provider/database
         * errors to the frontend.
         */

        if (
            error instanceof AppError
        ) {
            throw error;
        }


        throw new AppError(
            503,
            "EXTERNAL_API_FAILURE",
            "Product providers temporarily unavailable"
        );
    }
};


/*
 * ---------------------------------------------------------
 * REFRESH PRODUCT
 * ---------------------------------------------------------
 *
 * Forces fresh provider data.
 */

export const refreshProductByBarcode =
    async (
        barcode: string
    ) => {

        /*
         * Remove stale Redis data.
         */

        const cacheKey =
            productCacheKey(
                barcode
            );


        await productServiceDependencies
            .deleteCache(
                cacheKey
            );


        /*
         * Fetch fresh provider data and
         * update/create the product.
         */

        const product =
            await fetchFreshProduct(
                barcode
            );


        if (!product) {

            throw new AppError(
                404,
                "PRODUCT_NOT_FOUND",
                "Product not found"
            );
        }


        return product;
    };


/*
 * ---------------------------------------------------------
 * ADD PRODUCT
 * ---------------------------------------------------------
 */

export const addProduct = async (
    data: {
        barcode: string;

        name: string;

        brand?: string;

        category?: string;

        description?: string;

        imageUrl?: string;

        manufacturer?: string;

        country?: string;
    }
) => {

    return productServiceDependencies
        .createProduct(
            data
        );
};


/*
 * ---------------------------------------------------------
 * UPDATE PRODUCT
 * ---------------------------------------------------------
 */

export const updateProduct = async (
    productId: number,
    barcode: string,
    data: {
        name?: string;

        brand?: string;

        category?: string;

        description?: string;

        imageUrl?: string;

        manufacturer?: string;

        country?: string;
    }
) => {

    /*
     * Update PostgreSQL.
     */

    const updatedProduct =
        await productServiceDependencies
            .updateProductRepository(
                productId,
                data
            );


    /*
     * Invalidate Redis so the
     * next request gets fresh data.
     */

    const cacheKey =
        productCacheKey(
            barcode
        );


    await productServiceDependencies
        .deleteCache(
            cacheKey
        );


    return updatedProduct;
};
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

const generalProvider = new UPCItemDBProvider();

const foodProvider =
    new OpenFoodFactsProvider();

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

const buildSourceEntries = (
    products: Array<{
        source?: string;
        sourceUrl?: string;

        sources?: Array<{
            provider: string;
            sourceUrl?: string;
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
                isPrimary: boolean;
            }
        >();

    for (const product of products) {
        const entries =
            product.sources ??
            (product.source
                ? [
                      {
                          provider:
                              product.source,
                          sourceUrl:
                              product.sourceUrl,
                          isPrimary: true,
                      },
                  ]
                : []);

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

            if (!previous) {
                byProvider.set(
                    normalizedProvider,
                    {
                        provider:
                            normalizedProvider,
                        sourceUrl:
                            normalizedUrl,
                        isPrimary:
                            Boolean(
                                entry.isPrimary
                            ),
                    }
                );

                continue;
            }

            if (
                !previous.sourceUrl &&
                normalizedUrl
            ) {
                previous.sourceUrl =
                    normalizedUrl;
            }

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

export const fetchFreshProduct = async (
    barcode: string
) => {
    let externalProduct;
    let providerFailed = false;

    const sourceProducts: Array<{
        source?: string;
        sourceUrl?: string;

        sources?: Array<{
            provider: string;
            sourceUrl?: string;
            isPrimary?: boolean;
        }>;
    }> = [];

    /*
     * 1. Try primary/general provider
     */
    try {
        externalProduct =
            await productServiceDependencies.generalProvider
                .getProductByBarcode(
                    barcode
                );

        if (externalProduct) {
            sourceProducts.push(
                externalProduct
            );
        }
    } catch (error) {
        providerFailed = true;
        console.error(
            "UPCitemdb provider failed:",
            error instanceof Error
                ? error.message
                : "Unknown error"
        );
    }

    /*
     * 2. Fallback to Open Food Facts
     */
    if (!externalProduct) {
        try {
            externalProduct =
                await productServiceDependencies.foodProvider
                    .getProductByBarcode(
                        barcode
                    );

            if (externalProduct) {
                sourceProducts.push(
                    externalProduct
                );
            }
        } catch (fallbackError) {
            providerFailed = true;
            console.error(
                "Open Food Facts fallback failed:",
                fallbackError instanceof Error
                    ? fallbackError.message
                    : "Unknown error"
            );
        }
    }

            if (providerFailed) {
                throw new AppError(
                    503,
                    "EXTERNAL_API_FAILURE",
                    "Product providers temporarily unavailable"
                );
            }

    /*
     * 3. No provider found
     */
    if (!externalProduct) {
        await productServiceDependencies.setJsonCache(
            productCacheKey(
                barcode
            ),
            null,
            CACHE_TTL.PRODUCT_NOT_FOUND
        );

        return null;
    }

    /*
     * 4. Food enrichment
     */
    let enrichedProduct =
        externalProduct;

    if (
        isFoodProduct(
            enrichedProduct.category
        )
    ) {
        try {
            const foodProduct =
                await productServiceDependencies.foodProvider
                    .getProductByBarcode(
                        barcode
                    );

            if (foodProduct) {
                sourceProducts.push(
                    foodProduct
                );

                enrichedProduct = {
                    ...enrichedProduct,

                    ingredients:
                        foodProduct.ingredients ??
                        enrichedProduct.ingredients,

                    attributes: {
                        ...enrichedProduct.attributes,
                        ...foodProduct.attributes,
                    },

                    nutrition:
                        foodProduct.nutrition ??
                        enrichedProduct.nutrition,

                    source:
                        enrichedProduct.source,

                    sourceUrl:
                        enrichedProduct.sourceUrl,

                    sources:
                        buildSourceEntries([
                            enrichedProduct,
                            foodProduct,
                        ]),
                };
            }
        } catch (error) {
            console.error(
                "Food provider enrichment failed:",
                error instanceof Error
                    ? error.message
                    : "Unknown error"
            );
        }
    }

    /*
     * 5. Build source/provenance
     *
     * The first provider is treated
     * as the primary source.
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
     * 6. Normalize external data
     */
    const normalizedProduct =
        normalizeProduct({
            ...enrichedProduct,

            sources:
                normalizedSources,
        });

    /*
     * 7. Check whether product
     * already exists
     */
    const existingProduct =
        await productServiceDependencies.findProductByBarcode(
            barcode
        );

    let savedProduct;

    /*
     * 8. Existing product
     *
     * Refresh all provider-backed
     * product information.
     */
    if (existingProduct) {
        savedProduct =
            await productServiceDependencies.refreshProductData(
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
     * 9. New product
     */
    else {
        try {
            savedProduct =
                await productServiceDependencies.createProduct({
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
                    await productServiceDependencies.findProductByBarcode(
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
     * 10. Cache final product
     */
    await productServiceDependencies.setJsonCache(
        productCacheKey(
            barcode
        ),
        savedProduct,
        CACHE_TTL.PRODUCT
    );

    return savedProduct;
};

export const getProductByBarcode = async (
    barcode: string
) => {
    /*
     * 1. Redis
     */
    const cacheKey =
        productCacheKey(
            barcode
        );

    const cachedProduct =
        await productServiceDependencies.getJsonCache(
            cacheKey
        );

    if (cachedProduct.hit) {
        return cachedProduct.value;
    }

    /*
     * 2. PostgreSQL
     */
    const existingProduct =
        await productServiceDependencies.findProductByBarcode(
            barcode
        );

    if (existingProduct) {
        await productServiceDependencies.setJsonCache(
            cacheKey,
            existingProduct,
            CACHE_TTL.PRODUCT
        );

        return existingProduct;
    }

    /*
     * 3. External providers
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

        throw new AppError(
            503,
            "EXTERNAL_API_FAILURE",
            "Product providers temporarily unavailable"
        );
    }
};

export const refreshProductByBarcode =
    async (
        barcode: string
    ) => {
        /*
         * Remove stale Redis data
         */
        const cacheKey =
            productCacheKey(
                barcode
            );

        await productServiceDependencies.deleteCache(
            cacheKey
        );

        /*
         * Fetch fresh provider
         * data and update/create
         * the product.
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
    return productServiceDependencies.createProduct(
        data
    );
};

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
     * Update PostgreSQL
     */
    const updatedProduct =
        await productServiceDependencies.updateProductRepository(
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

    await productServiceDependencies.deleteCache(
        cacheKey
    );

    return updatedProduct;
};
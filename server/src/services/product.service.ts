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

import {
    productCacheKey,
} from "../utils/cache-key.js";

import {
    UPCItemDBProvider,
} from "./upcitemdb.provider.js";

import {
    OpenFoodFactsProvider,
} from "./openfoodfacts.provider.js";

import {
    normalizeProduct,
} from "./product.normalizer.js";

import {
    AppError,
} from "../utils/app-error.js";

import {
    CACHE_TTL,
} from "../config/cache.js";

import type {
    ExternalProduct,
} from "./product-provider.service.js";

import {
    calculateNutritionGrade,
    type NutritionGradeResult,
    type NutritionUnit,
    type NutritionGradeNutrition,
} from "./nutrition-grade.service.js";


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
 * with mocks.
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
 * PRODUCT TYPE
 * ---------------------------------------------------------
 */

export interface ProductWithNutrition {
    id: number;

    barcode: string;

    modelNumber?: string | null;

    name: string;

    brand?: string | null;

    category?: string | null;

    description?: string | null;

    imageUrl?: string | null;

    manufacturer?: string | null;

    country?: string | null;

    createdAt: Date;

    updatedAt: Date;

    nutrition?: {
        calories?: number | null;

        protein?: number | null;

        carbohydrates?: number | null;

        fat?: number | null;

        saturatedFat?: number | null;

        sugars?: number | null;

        fiber?: number | null;

        salt?: number | null;

        sodium?: number | null;

        /*
         * IMPORTANT:
         *
         * Nutrition can be reported per 100g
         * or per 100ml.
         */

        unit?:
            | "per_100g"
            | "per_100ml"
            | null;

        source?: string | null;
    } | null;

    ingredients?: Array<{
        id: number;

        productId: number;

        name: string;

        description?: string | null;
    }>;

    attributes?: Array<{
        id: number;

        productId: number;

        key: string;

        value: string;
    }>;

    prices?: Array<{
        id: number;

        productId: number;

        amount: Prisma.Decimal;

        priceType: string;

        currency: string;

        merchant?: string | null;

        source?: string | null;

        availability?: string | null;

        createdAt: Date;

        updatedAt: Date;
    }>;

    sources?: Array<{
        id: number;

        productId: number;

        provider: string;

        sourceUrl?: string | null;

        rawData?: Prisma.JsonValue | null;

        isPrimary: boolean;

        createdAt: Date;

        updatedAt: Date;
    }>;

    nutritionGrade?: NutritionGradeResult;
}


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
 * rawData is preserved because verification
 * uses provider responses as evidence.
 */

const buildSourceEntries = (
    products: Array<{
        source?: string;

        sourceUrl?: string;

        sources?: Array<{
            provider: string;

            sourceUrl?: string;

            rawData?:
                Prisma.InputJsonValue;

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

                rawData?:
                    Prisma.InputJsonValue;

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

                            isPrimary:
                                true,
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


            if (
                !previous.sourceUrl &&
                normalizedUrl
            ) {

                previous.sourceUrl =
                    normalizedUrl;
            }


            if (
                !previous.rawData &&
                entry.rawData
            ) {

                previous.rawData =
                    entry.rawData;
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


/*
 * ---------------------------------------------------------
 * NUTRITION HELPERS
 * ---------------------------------------------------------
 */


/*
 * Convert the database/provider nutrition object
 * into the strict input expected by the grade engine.
 *
 * We do NOT convert per_100ml into per_100g.
 */

const normalizeNutritionForGrade = (
    nutrition:
        ProductWithNutrition["nutrition"]
): NutritionGradeNutrition | null => {

    if (!nutrition) {
        return null;
    }


    let unit:
        NutritionUnit;


    if (
        nutrition.unit ===
        "per_100ml"
    ) {

        unit =
            "per_100ml";

    } else {

        /*
         * Existing products created before the
         * per_100ml support use per_100g.
         */

        unit =
            "per_100g";
    }


    return {

        calories:
            nutrition.calories,

        protein:
            nutrition.protein,

        carbohydrates:
            nutrition.carbohydrates,

        fat:
            nutrition.fat,

        saturatedFat:
            nutrition.saturatedFat,

        sugars:
            nutrition.sugars,

        fiber:
            nutrition.fiber,

        salt:
            nutrition.salt,

        sodium:
            nutrition.sodium,

        unit,

        source:
            nutrition.source,
    };
};


/*
 * ---------------------------------------------------------
 * ATTACH NUTRITION GRADE
 * ---------------------------------------------------------
 *
 * Products without nutrition data are returned unchanged.
 *
 * This is important for:
 *
 * - existing product service tests
 * - non-food products
 * - products where nutrition isn't available
 */

const attachNutritionGrade = (
    product:
        ProductWithNutrition
        | null
): ProductWithNutrition | null => {

    if (!product) {
        return null;
    }


    /*
     * Do not add a nutritionGrade field when
     * nutrition data does not exist.
     *
     * This preserves the existing service behavior.
     */

    if (!product.nutrition) {
        return product;
    }


    const nutritionInput =
        normalizeNutritionForGrade(
            product.nutrition
        );


    const nutritionGrade =
        calculateNutritionGrade(
            nutritionInput
        );


    return {
        ...product,

        nutritionGrade,
    };
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
 * Open Food Facts is called at most once per request.
 */

export const fetchFreshProduct = async (
    barcode: string
) => {

    let externalProduct:
        ExternalProduct | null =
        null;


    let foodProduct:
        ExternalProduct | null =
        null;


    let generalProviderFailed =
        false;


    let foodProviderFailed =
        false;


    const sourceProducts:
        Array<{
            source?: string;

            sourceUrl?: string;

            sources?: Array<{
                provider: string;

                sourceUrl?: string;

                rawData?:
                    Prisma.InputJsonValue;

                isPrimary?: boolean;
            }>;
        }> = [];


    /*
     * -----------------------------------------------------
     * 1. PRIMARY PROVIDER
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
     * 2. OPEN FOOD FACTS FALLBACK
     * -----------------------------------------------------
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
     * 3. PROVIDER FAILURE
     * -----------------------------------------------------
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
     * 4. PRODUCT NOT FOUND
     * -----------------------------------------------------
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
             * Reuse the Open Food Facts result
             * if it was already fetched.
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

            /*
             * Food enrichment is optional.
             *
             * The primary product remains usable.
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
     * 6. SOURCE / PROVENANCE
     * -----------------------------------------------------
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
     * 7. NORMALIZE
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
     * 8. FIND EXISTING PRODUCT
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
     * 9. UPDATE EXISTING PRODUCT
     * -----------------------------------------------------
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

    } else {

        /*
         * -------------------------------------------------
         * 10. CREATE NEW PRODUCT
         * -------------------------------------------------
         */

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
             * Concurrent barcode creation.
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
     * 11. CACHE
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


    /*
     * Attach grade to the returned product.
     */

    return attachNutritionGrade(
        savedProduct as ProductWithNutrition
    );
};


/*
 * ---------------------------------------------------------
 * GET PRODUCT BY BARCODE
 * ---------------------------------------------------------
 */

export const getProductByBarcode = async (
    barcode: string
) => {

    const cacheKey =
        productCacheKey(
            barcode
        );


    /*
     * -----------------------------------------------------
     * 1. REDIS
     * -----------------------------------------------------
     */

    const cachedProduct =
        await productServiceDependencies
            .getJsonCache(
                cacheKey
            );


    if (cachedProduct.hit) {

        /*
         * Cached product may already contain
         * nutritionGrade.
         *
         * If not, calculate it from nutrition.
         */

        return attachNutritionGrade(
            cachedProduct.value as
                ProductWithNutrition
        );
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

        const productWithGrade =
            attachNutritionGrade(
                existingProduct as
                    ProductWithNutrition
            );


        /*
         * Warm Redis.
         */

        await productServiceDependencies
            .setJsonCache(
                cacheKey,
                productWithGrade,
                CACHE_TTL.PRODUCT
            );


        return productWithGrade;
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
 */

export const refreshProductByBarcode =
    async (
        barcode: string
    ) => {

        /*
         * Delete stale Redis data.
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
         * Fetch fresh provider data.
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
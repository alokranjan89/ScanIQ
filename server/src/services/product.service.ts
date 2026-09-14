import {
    findProductByBarcode,
    createProduct,
    updateProduct as updateProductRepository,
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
import { ProviderError } from "../utils/provider-error.js";
import { CACHE_TTL } from "../config/cache.js";

const generalProvider = new UPCItemDBProvider();
const foodProvider = new OpenFoodFactsProvider();

const isFoodProduct = (category?: string): boolean => {
    if (!category) {
        return false;
    }

    const value = category.toLowerCase();

    const foodKeywords = [
        "food",
        "beverage",
        "grocery",
        "drink",
        "snack",
        "tobacco",
    ];

    return foodKeywords.some((keyword) =>
        value.includes(keyword)
    );
};

export const getProductByBarcode = async (barcode: string) => {
    // 1. Check Redis first
    const cacheKey = productCacheKey(barcode);
    const cachedProduct = await getJsonCache(cacheKey);

    if (cachedProduct.hit) {
        return cachedProduct.value;
    }
    // 2. Check our database
    const existingProduct =
        await findProductByBarcode(barcode);

    if (existingProduct) {
        await setJsonCache(
            cacheKey,
            existingProduct,
            CACHE_TTL.PRODUCT
        );

        return existingProduct;
    }
    // 3. Ask the general product provider
    let externalProduct;

    try {
        externalProduct =
            await generalProvider.getProductByBarcode(barcode);
    } catch (error) {
        if (error instanceof Error) {
            console.error(
                "UPCitemdb provider failed:",
                error.message
            );
        }

        externalProduct = null;
    }

    if (!externalProduct) {
        try {
            externalProduct =
                await foodProvider.getProductByBarcode(barcode);
        } catch (error) {
            if (error instanceof Error) {
                console.error(
                    "Open Food Facts provider failed:",
                    error.message
                );
            }

            throw new ProviderError(
                "All product providers failed",
                "OpenFoodFacts"
            );
        }
    }

    if (!externalProduct) {
        await setJsonCache(
            cacheKey,
            null,
            CACHE_TTL.PRODUCT_NOT_FOUND
        );

        return null;
    }
    // 3. If this looks like a food product,
    //    enrich it with food-specific information
    if (isFoodProduct(externalProduct.category)) {
        try {
            const foodProduct =
                await foodProvider.getProductByBarcode(barcode);

            if (foodProduct) {
                externalProduct.ingredients =
                    foodProduct.ingredients;

                externalProduct.attributes = {
                    ...externalProduct.attributes,
                    ...foodProduct.attributes,
                };
                externalProduct.nutrition =
                    foodProduct.nutrition;
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

    // 4. Save the complete normalized product
    const normalizedProduct =
        normalizeProduct(externalProduct);

    const savedProduct = await createProduct({
        barcode: normalizedProduct.barcode,
        name: normalizedProduct.name,
        brand: normalizedProduct.brand,
        category: normalizedProduct.category,
        description: normalizedProduct.description,
        imageUrl: normalizedProduct.imageUrl,
        manufacturer: normalizedProduct.manufacturer,
        country: normalizedProduct.country,
        attributes: normalizedProduct.attributes,
        prices: normalizedProduct.prices,
        ingredients: normalizedProduct.ingredients,
        nutrition: normalizedProduct.nutrition,
    });

    await setJsonCache(
        cacheKey,
        savedProduct,
        CACHE_TTL.PRODUCT
    );

    return savedProduct;
};

export const addProduct = async (data: {
    barcode: string;
    name: string;
    brand?: string;
    category?: string;
    description?: string;
    imageUrl?: string;
    manufacturer?: string;
    country?: string;
}) => {
    return createProduct(data);
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
    const updatedProduct =
        await updateProductRepository(
            productId,
            data
        );

    const cacheKey = productCacheKey(barcode);

    await deleteCache(cacheKey);

    return updatedProduct;
};
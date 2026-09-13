import {
    findProductByBarcode,
    createProduct,
} from "../repositories/product.repository.js";

import { UPCItemDBProvider } from "./upcitemdb.provider.js";
import { OpenFoodFactsProvider } from "./openfoodfacts.provider.js";
import { normalizeProduct } from "./product.normalizer.js";

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
    // 1. Check our database first
    const existingProduct = await findProductByBarcode(barcode);

    if (existingProduct) {
        return existingProduct;
    }

    // 2. Ask the general product provider
    const externalProduct =
        await generalProvider.getProductByBarcode(barcode);

    if (!externalProduct) {
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
            }
        } catch (error) {
            console.error(
                "Food provider enrichment failed:",
                error
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
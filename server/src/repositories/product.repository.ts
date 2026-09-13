import prisma from "../config/prisma.js";

export const findProductByBarcode = async (barcode: string) => {
    return prisma.product.findUnique({
        where: {
            barcode,
        },
        include: {
            ingredients: true,
            attributes: true,
            prices: true,
            nutrition: true,
        },
    });
};

export const createProduct = async (data: {
    barcode: string;
    name: string;
    brand?: string;
    category?: string;
    description?: string;
    imageUrl?: string;
    manufacturer?: string;
    country?: string;
    attributes?: Record<string, string>;

    prices?: Array<{
        amount: number;
        priceType: string;
        currency: string;
        merchant?: string;
        source?: string;
        availability?: string;
    }>;

    ingredients?: Array<{
        name: string;
        description?: string;
    }>;

    nutrition?: {
        calories?: number;
        protein?: number;
        carbohydrates?: number;
        fat?: number;
        saturatedFat?: number;
        sugars?: number;
        fiber?: number;
        salt?: number;
        sodium?: number;
        unit?: string;
        source?: string;
    };
}) => {
    return prisma.product.create({
        data: {
            barcode: data.barcode,
            name: data.name,
            brand: data.brand,
            category: data.category,
            description: data.description,
            imageUrl: data.imageUrl,
            manufacturer: data.manufacturer,
            country: data.country,

            attributes: data.attributes
                ? {
                    create: Object.entries(data.attributes).map(
                        ([key, value]) => ({
                            key,
                            value,
                        })
                    ),
                }
                : undefined,

            prices: data.prices
                ? {
                    create: data.prices.map((price) => ({
                        amount: price.amount,
                        priceType: price.priceType,
                        currency: price.currency,
                        merchant: price.merchant,
                        source: price.source,
                        availability: price.availability,
                    })),
                }
                : undefined,

            ingredients: data.ingredients
                ? {
                    create: data.ingredients.map((ingredient) => ({
                        name: ingredient.name,
                        description: ingredient.description,
                    })),
                }
                : undefined,

            nutrition: data.nutrition
                ? {
                    create: {
                        calories: data.nutrition.calories,
                        protein: data.nutrition.protein,
                        carbohydrates: data.nutrition.carbohydrates,
                        fat: data.nutrition.fat,
                        saturatedFat: data.nutrition.saturatedFat,
                        sugars: data.nutrition.sugars,
                        fiber: data.nutrition.fiber,
                        salt: data.nutrition.salt,
                        sodium: data.nutrition.sodium,
                        unit: data.nutrition.unit ?? "per_100g",
                        source: data.nutrition.source,
                    },
                }
                : undefined,
        },

        include: {
            ingredients: true,
            attributes: true,
            prices: true,
            nutrition: true,
        },
    });
};

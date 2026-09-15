import { Prisma } from "../generated/prisma/client.js";
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
            sources: true,
        },
    });
};

export const findProductById = async (productId: number) => {
    return prisma.product.findUnique({
        where: {
            id: productId,
        },
        include: {
            ingredients: true,
            attributes: true,
            prices: true,
            nutrition: true,
            sources: true,
        },
    });
};

export const createProduct = async (data: {
    barcode: string;
    modelNumber?: string;
    name: string;
    brand?: string;
    category?: string;
    description?: string;
    imageUrl?: string;
    manufacturer?: string;
    country?: string;

    attributes?: Record<string, string>;

    source?: string;
    sourceUrl?: string;

    sources?: Array<{
        provider: string;
        sourceUrl?: string;
        rawData?: Prisma.InputJsonValue;
        isPrimary?: boolean;
    }>;

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
            modelNumber: data.modelNumber,
            name: data.name,
            brand: data.brand,
            category: data.category,
            description: data.description,
            imageUrl: data.imageUrl,
            manufacturer: data.manufacturer,
            country: data.country,

            sources: data.sources
                ? {
                      create: data.sources.map((source) => ({
                          provider: source.provider,
                          sourceUrl: source.sourceUrl,
                          rawData: source.rawData,
                          isPrimary: source.isPrimary ?? false,
                      })),
                  }
                : undefined,

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
                          unit:
                              data.nutrition.unit ??
                              "per_100g",
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
            sources: true,
        },
    });
};

export const updateProduct = async (
    productId: number,
    data: {
        name?: string;
        brand?: string;
        category?: string;
        description?: string;
        imageUrl?: string;
        manufacturer?: string;
        country?: string;
        modelNumber?: string;
    }
) => {
    return prisma.product.update({
        where: {
            id: productId,
        },
        data,

        include: {
            ingredients: true,
            attributes: true,
            prices: true,
            nutrition: true,
            sources: true,
        },
    });
};

export const replaceProductSources = async (
    productId: number,
    sources: Array<{
        provider: string;
        sourceUrl?: string;
        rawData?: Prisma.InputJsonValue;
        isPrimary?: boolean;
    }>
) => {
    return prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
            await tx.productSource.deleteMany({
                where: {
                    productId,
                },
            });

            if (sources.length > 0) {
                await tx.productSource.createMany({
                    data: sources.map((source) => ({
                        productId,
                        provider: source.provider,
                        sourceUrl: source.sourceUrl,
                        rawData: source.rawData,
                        isPrimary:
                            source.isPrimary ?? false,
                    })),
                });
            }

            return tx.productSource.findMany({
                where: {
                    productId,
                },
            });
        }
    );
};

export const refreshProductData = async (
    productId: number,
    data: {
        name: string;
        brand?: string;
        category?: string;
        description?: string;
        imageUrl?: string;
        manufacturer?: string;
        country?: string;
        modelNumber?: string;

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

        sources?: Array<{
            provider: string;
            sourceUrl?: string;
            rawData?: Prisma.InputJsonValue;
            isPrimary?: boolean;
        }>;
    }
) => {
    return prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
            await tx.product.update({
                where: {
                    id: productId,
                },

                data: {
                    name: data.name,
                    modelNumber: data.modelNumber,
                    brand: data.brand,
                    category: data.category,
                    description: data.description,
                    imageUrl: data.imageUrl,
                    manufacturer: data.manufacturer,
                    country: data.country,
                },
            });

            await tx.productIngredient.deleteMany({
                where: {
                    productId,
                },
            });

            if (data.ingredients?.length) {
                await tx.productIngredient.createMany({
                    data: data.ingredients.map(
                        (ingredient) => ({
                            productId,
                            name: ingredient.name,
                            description:
                                ingredient.description,
                        })
                    ),
                });
            }

            await tx.productAttribute.deleteMany({
                where: {
                    productId,
                },
            });

            if (data.attributes) {
                const attributes =
                    Object.entries(data.attributes);

                if (attributes.length > 0) {
                    await tx.productAttribute.createMany({
                        data: attributes.map(
                            ([key, value]) => ({
                                productId,
                                key,
                                value,
                            })
                        ),
                    });
                }
            }

            await tx.productPrice.deleteMany({
                where: {
                    productId,
                },
            });

            if (data.prices?.length) {
                await tx.productPrice.createMany({
                    data: data.prices.map((price) => ({
                        productId,
                        amount: price.amount,
                        priceType: price.priceType,
                        currency: price.currency,
                        merchant: price.merchant,
                        source: price.source,
                        availability:
                            price.availability,
                    })),
                });
            }

            await tx.productNutrition.deleteMany({
                where: {
                    productId,
                },
            });

            if (data.nutrition) {
                await tx.productNutrition.create({
                    data: {
                        productId,
                        calories:
                            data.nutrition.calories,
                        protein:
                            data.nutrition.protein,
                        carbohydrates:
                            data.nutrition.carbohydrates,
                        fat: data.nutrition.fat,
                        saturatedFat:
                            data.nutrition.saturatedFat,
                        sugars:
                            data.nutrition.sugars,
                        fiber:
                            data.nutrition.fiber,
                        salt:
                            data.nutrition.salt,
                        sodium:
                            data.nutrition.sodium,
                        unit:
                            data.nutrition.unit ??
                            "per_100g",
                        source:
                            data.nutrition.source,
                    },
                });
            }

            await tx.productSource.deleteMany({
                where: {
                    productId,
                },
            });

            if (data.sources?.length) {
                await tx.productSource.createMany({
                    data: data.sources.map(
                        (source) => ({
                            productId,
                            provider:
                                source.provider,
                            sourceUrl:
                                source.sourceUrl,
                            rawData:
                                source.rawData,
                            isPrimary:
                                source.isPrimary ??
                                false,
                        })
                    ),
                });
            }

            return tx.product.findUnique({
                where: {
                    id: productId,
                },

                include: {
                    ingredients: true,
                    attributes: true,
                    prices: true,
                    nutrition: true,
                    sources: true,
                },
            });
        }
    );
};
import {
    ExternalProduct,
    ProductSourceInfo,
} from "./product-provider.service.js";

export interface NormalizedProduct {
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
    barcode: string;
    name: string;
    brand?: string;
    category?: string;
    description?: string;
    imageUrl?: string;
    manufacturer?: string;
    country?: string;
    source?: string;
    sourceUrl?: string;
    sources?: ProductSourceInfo[];

    ingredients?: Array<{
        name: string;
        description?: string;
    }>;

    attributes?: Record<string, string>;

    prices?: Array<{
        amount: number;
        priceType: string;
        currency: string;
        merchant?: string;
        source?: string;
        availability?: string;
    }>;
}

const normalizeSources = (
    productSources?: ProductSourceInfo[]
): ProductSourceInfo[] | undefined => {
    if (!productSources || productSources.length === 0) {
        return undefined;
    }

    return productSources
        .filter((source) => source.provider.trim().length > 0)
        .map((source) => ({
            provider: source.provider.trim(),
            sourceUrl: source.sourceUrl?.trim(),
            isPrimary: Boolean(source.isPrimary),
        }))
        .filter(
            (source, index, array) =>
                array.findIndex(
                    (candidate) =>
                        candidate.provider === source.provider
                ) === index
        );
};

export const normalizeProduct = (
    product: ExternalProduct
): NormalizedProduct => {
    const primarySource =
        product.sources?.find((source) => source.isPrimary) ??
        product.sources?.[0];

    return {
        barcode: product.barcode.trim(),
        name: product.name.trim(),

        brand: product.brand?.trim(),
        category: product.category?.trim(),
        description: product.description?.trim(),
        imageUrl: product.imageUrl?.trim(),
        manufacturer: product.manufacturer?.trim(),
        country: product.country?.trim(),
        source:
            product.source?.trim() ??
            primarySource?.provider?.trim(),
        sourceUrl:
            product.sourceUrl?.trim() ??
            primarySource?.sourceUrl?.trim(),
        sources: normalizeSources(
            product.sources ??
                (product.source
                    ? [{
                          provider: product.source,
                          sourceUrl: product.sourceUrl,
                          isPrimary: true,
                      }]
                    : undefined)
        ),


        ingredients: product.ingredients?.filter(
            (ingredient) =>
                ingredient.name.trim().length > 0
        ),

        attributes: product.attributes
            ? Object.fromEntries(
                Object.entries(product.attributes)
                    .map(([key, value]) => [
                        key.trim(),
                        value.trim(),
                    ])
                    .filter(
                        ([key, value]) =>
                            key.length > 0 &&
                            value.length > 0
                    )
            )
            : undefined,

        prices: product.prices
            ?.filter(
                (price) =>
                    Number.isFinite(price.amount) &&
                    price.amount >= 0 &&
                    price.currency.trim().length > 0 &&
                    ["SALE", "LIST", "MRP"].includes(
                        price.priceType
                    )
            )
            .map((price) => ({
                amount: price.amount,
                priceType: price.priceType,
                currency: price.currency.trim().toUpperCase(),
                merchant: price.merchant?.trim(),
                source: price.source?.trim(),
                availability: price.availability?.trim(),
            })),
        nutrition: product.nutrition,
    };
};
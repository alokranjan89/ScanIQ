export interface ExternalProductPrice {
    amount: number;
    priceType: string;
    currency: string;
    merchant?: string;
    source?: string;
    availability?: string;
}
export interface ExternalProductNutrition {
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
}

export interface ExternalProduct {
    barcode: string;
    name: string;
    brand?: string;
    category?: string;
    description?: string;
    imageUrl?: string;
    manufacturer?: string;
    country?: string;

    ingredients?: Array<{
        name: string;
        description?: string;
    }>;

    attributes?: Record<string, string>;

    prices?: ExternalProductPrice[];
    nutrition?: ExternalProductNutrition;
}

export interface ProductProvider {
    getProductByBarcode(
        barcode: string
    ): Promise<ExternalProduct | null>;
}
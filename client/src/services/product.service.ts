import { api } from "../lib/api";

export interface Product {
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

  ingredients?: Array<{
    name: string;
    description?: string | null;
  }>;

  attributes?: Array<{
    key: string;
    value: string;
  }>;

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
    unit?: string | null;
  } | null;

  nutritionGrade?: {
    grade: "A" | "B" | "C" | "D" | "E" | null;
    score: number | null;
    calculated: boolean;
    unit: "per_100g" | "per_100ml";

    dataCompleteness: {
      available: number;
      required: number;
      percentage: number;
    };

    warnings: Array<{
      code:
        | "HIGH_SUGAR"
        | "HIGH_SATURATED_FAT"
        | "HIGH_SODIUM"
        | "LOW_FIBER"
        | "HIGH_CALORIES";
      title: string;
      message: string;
      severity: "info" | "warning" | "high";
    }>;

    explanation: string;
  } | null;

  prices?: Array<{
    amount: number;
    priceType: string;
    currency: string;
    merchant?: string | null;
  }>;

  sources?: Array<{
    provider: string;
    sourceUrl?: string | null;
    isPrimary: boolean;
  }>;
}

interface ProductResponse {
  data: Product;
}

export const getProductByBarcode = async (
  barcode: string,
): Promise<Product> => {
  const response = await api<ProductResponse>(
    `/products/barcode/${encodeURIComponent(barcode)}`,
  );

  return response.data;
};
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

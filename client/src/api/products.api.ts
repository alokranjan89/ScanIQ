import { apiRequest } from "./client";
import type {
    Product,
    ProductSearchItem,
    VerificationResult,
} from "../types/api";

type ProductResponse = {
    data: Product;
};

type SearchResponse = {
    data: {
        products: ProductSearchItem[];
        total?: number;
    };
};

export const getProductByBarcode = async (
    barcode: string,
): Promise<Product> => {
    const response =
        await apiRequest<ProductResponse>(
            `/products/barcode/${encodeURIComponent(
                barcode,
            )}`,
        );

    return response.data;
};

export const refreshProductByBarcode = async (
    barcode: string,
): Promise<Product> => {
    const response =
        await apiRequest<ProductResponse>(
            `/products/barcode/${encodeURIComponent(
                barcode,
            )}/refresh`,
            {
                method: "POST",
            },
        );

    return response.data;
};

export const getProductById = async (
    productId: number,
): Promise<Product> => {
    const response =
        await apiRequest<ProductResponse>(
            `/products/${productId}`,
        );

    return response.data;
};

export const searchProducts = async (
    query: string,
    limit = 20,
): Promise<SearchResponse> => {
    return apiRequest<SearchResponse>(
        `/products/search?q=${encodeURIComponent(
            query.trim(),
        )}&limit=${limit}`,
    );
};

export const verifyProduct = async (
    productId: number,
): Promise<VerificationResult> => {
    return apiRequest<VerificationResult>(
        `/products/${productId}/verification`,
    );
};
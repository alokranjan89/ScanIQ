import { apiRequest } from "./client";

import type { Product } from "../types/api";

type ComparisonApiResponse = {
    data: {
        products: Product[];
    };
};

export const compareProducts = async (
    productId1: number,
    productId2: number,
): Promise<Product[]> => {
    const params = new URLSearchParams({
        productId1: String(productId1),
        productId2: String(productId2),
    });

    const response =
        await apiRequest<ComparisonApiResponse>(
            `/products/compare?${params.toString()}`,
        );

    return response.data.products;
};
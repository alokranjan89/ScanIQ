import { apiRequest } from "./client";

import type {
    ProductSearchItem,
} from "../types/api";

type SearchApiResponse = {
    data: {
        products: ProductSearchItem[];
        total?: number;
    };
};

export const searchProducts = async (
    query: string,
    limit = 20,
): Promise<ProductSearchItem[]> => {
    const params = new URLSearchParams({
        q: query.trim(),
        limit: String(limit),
    });

    const response =
        await apiRequest<SearchApiResponse>(
            `/products/search?${params.toString()}`,
        );

    return response.data.products;
};
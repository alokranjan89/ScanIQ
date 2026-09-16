import { apiRequest } from "./client";

import type {
    Favorite,
} from "../types/api";

type FavoritesApiResponse = {
    data: Favorite[];
};

export const getFavorites = async (): Promise<Favorite[]> => {
    const response =
        await apiRequest<FavoritesApiResponse>(
            "/favorites",
        );

    return response.data;
};

export const addFavorite = async (
    productId: number,
): Promise<Favorite> => {
    const response =
        await apiRequest<{ data: Favorite }>(
            `/favorites/${productId}`,
            {
                method: "POST",
            },
        );

    return response.data;
};

export const removeFavorite = async (
    productId: number,
): Promise<void> => {
    await apiRequest(
        `/favorites/${productId}`,
        {
            method: "DELETE",
        },
    );
};
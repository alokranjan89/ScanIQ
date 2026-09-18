import { apiRequest } from "./client";

import type {
    Favorite,
} from "../types/api";

type FavoritesApiResponse = {
    data: {
        favorites: Favorite[];
    };
};

export const getFavorites = async (): Promise<Favorite[]> => {
    const response =
        await apiRequest<FavoritesApiResponse>(
            "/favorites",
        );

    return response.data.favorites;
};

export const addFavorite = async (
    productId: number,
): Promise<Favorite> => {
    const response =
        await apiRequest<{
            data: {
                favorite: Favorite;
            };
        }>(
            `/favorites/${productId}`,
            {
                method: "POST",
            },
        );

    return response.data.favorite;
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

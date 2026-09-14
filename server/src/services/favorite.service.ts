import {
  createFavorite,
  findFavoritesByUserId,
  findFavoriteByUserAndProduct,
  deleteFavoriteByUserAndProduct,
} from "../repositories/favorite.repository.js";

import { AppError } from "../utils/app-error.js";

export const addFavorite = async (
  userId: number,
  productId: number
) => {
  const existingFavorite =
    await findFavoriteByUserAndProduct(
      userId,
      productId
    );

  if (existingFavorite) {
    throw new AppError(
      409,
      "FAVORITE_ALREADY_EXISTS",
      "Product is already in favorites"
    );
  }

  try {
    return await createFavorite({
      userId,
      productId,
    });
  } catch (error: unknown) {
    // Handle a concurrent request that creates
    // the same favorite at the same time.
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      throw new AppError(
        409,
        "FAVORITE_ALREADY_EXISTS",
        "Product is already in favorites"
      );
    }

    throw error;
  }
};

export const getFavorites = async (
  userId: number
) => {
  return findFavoritesByUserId(userId);
};

export const removeFavorite = async (
  userId: number,
  productId: number
) => {
  const result =
    await deleteFavoriteByUserAndProduct(
      userId,
      productId
    );

  if (result.count === 0) {
    throw new AppError(
      404,
      "FAVORITE_NOT_FOUND",
      "Favorite not found"
    );
  }

  return {
    success: true,
  };
};
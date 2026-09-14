import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favorite.service.js";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

export const createFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedRequest =
      req as AuthenticatedRequest;

    const favorite = await addFavorite(
      authenticatedRequest.user.id,
      Number(req.params.productId)
    );

    return res.status(201).json({
      data: {
        favorite,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFavoriteList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedRequest =
      req as AuthenticatedRequest;

    const favorites = await getFavorites(
      authenticatedRequest.user.id
    );

    return res.status(200).json({
      data: {
        favorites,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedRequest =
      req as AuthenticatedRequest;

    await removeFavorite(
      authenticatedRequest.user.id,
      Number(req.params.productId)
    );

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
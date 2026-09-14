import { Router } from "express";

import {
  createFavorite,
  getFavoriteList,
  deleteFavorite,
} from "../controllers/favorite.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  favoriteProductSchema,
} from "../validators/favorite.validator.js";

const router = Router();

router.post(
  "/:productId",
  requireAuth,
  validate(
    favoriteProductSchema,
    "INVALID_FAVORITE_PRODUCT_ID",
    "Invalid product ID"
  ),
  createFavorite
);

router.get(
  "/",
  requireAuth,
  getFavoriteList
);

router.delete(
  "/:productId",
  requireAuth,
  validate(
    favoriteProductSchema,
    "INVALID_FAVORITE_PRODUCT_ID",
    "Invalid product ID"
  ),
  deleteFavorite
);

export default router;
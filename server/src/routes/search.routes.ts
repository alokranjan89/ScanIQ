import { Router } from "express";

import {
  searchProducts,
} from "../controllers/search.controller.js";

import {
  validate,
} from "../middleware/validate.middleware.js";

import {
  productSearchSchema,
} from "../validators/search.validator.js";

const router = Router();

router.get(
  "/",
  validate(
    productSearchSchema,
    "INVALID_SEARCH_QUERY",
    "Invalid search query"
  ),
  searchProducts
);

export default router;
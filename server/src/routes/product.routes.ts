import { Router } from "express";

import {
    getProduct,
    getProductById,
    refreshProduct,
} from "../controllers/product.controller.js";

import {
    productLookupRateLimiter,
} from "../middleware/rate-limit.middleware.js";

import {
    validate,
} from "../middleware/validate.middleware.js";

import {
    productBarcodeSchema,
} from "../validators/product.validator.js";

const router = Router();

router.get(
    "/barcode/:barcode",
    productLookupRateLimiter,
    validate(
        productBarcodeSchema,
        "INVALID_BARCODE",
        "Invalid barcode"
    ),
    getProduct
);

router.post(
    "/barcode/:barcode/refresh",
    productLookupRateLimiter,
    validate(
        productBarcodeSchema,
        "INVALID_BARCODE",
        "Invalid barcode"
    ),
    refreshProduct
);

router.get(
    "/:productId",
    getProductById
);

export default router;
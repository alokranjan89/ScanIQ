import { Router } from "express";

import { getProduct } from "../controllers/product.controller.js";
import { productLookupRateLimiter } from "../middleware/rate-limit.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { productBarcodeSchema } from "../validators/product.validator.js";

const router = Router();

router.get(
    "/barcode/:barcode",
    productLookupRateLimiter,
    validate(productBarcodeSchema),
    getProduct
);

export default router;
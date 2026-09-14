import { Router } from "express";
import { getProduct } from "../controllers/product.controller.js";
import { productLookupRateLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.get(
    "/barcode/:barcode",
    productLookupRateLimiter,
    getProduct
);

export default router;
import { Router } from "express";

import {
    compareProductsController,
} from "../controllers/comparison.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import {
    compareProductsSchema,
} from "../validators/comparison.validator.js";

const router = Router();

router.get(
    "/compare",
    validate(
        compareProductsSchema,
        "INVALID_COMPARISON_REQUEST",
        "Invalid comparison request",
    ),
    compareProductsController,
);

export default router;
import { Router } from "express";

import {
  explainProductController,
} from "../controllers/ai.controller.js";

import { validate } from "../middleware/validate.middleware.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { aiRateLimiter } from "../middleware/rate-limit.middleware.js";

import {
  explainProductSchema,
} from "../validators/ai.validator.js";

const router = Router();

router.post(
  "/explain",
  requireAuth,
  aiRateLimiter,
  validate(
    explainProductSchema,
    "INVALID_AI_REQUEST",
    "Invalid AI request"
  ),
  explainProductController
);

export default router;
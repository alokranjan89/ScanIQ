import { Router } from "express";

import {
  explainProductController,
} from "../controllers/ai.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  explainProductSchema,
} from "../validators/ai.validator.js";

const router = Router();

router.post(
  "/explain",
  validate(
    explainProductSchema,
    "INVALID_AI_REQUEST",
    "Invalid AI request"
  ),
  explainProductController
);

export default router;
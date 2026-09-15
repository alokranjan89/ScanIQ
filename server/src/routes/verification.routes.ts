import { Router } from "express";

import {
    verifyProductController,
} from "../controllers/verification.controller.js";

const router = Router();

router.get(
    "/:productId/verification",
    verifyProductController
);

export default router;
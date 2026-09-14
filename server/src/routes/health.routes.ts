import { Router } from "express";
import { healthCheck } from "../controllers/health.controller.js";

const router = Router();

router.get("/api/v1/health", healthCheck);

export default router;
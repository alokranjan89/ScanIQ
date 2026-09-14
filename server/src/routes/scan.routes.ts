import { Router } from "express";

import {
  createScan,
  getHistory,
  deleteScan,
} from "../controllers/scan.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  createScanSchema,
  scanHistorySchema,
  deleteScanSchema,
} from "../validators/scan.validator.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(
    createScanSchema,
    "INVALID_SCAN_DATA",
    "Invalid scan data"
  ),
  createScan
);

router.get(
  "/",
  requireAuth,
  validate(
    scanHistorySchema,
    "INVALID_SCAN_QUERY",
    "Invalid scan history query"
  ),
  getHistory
);

router.delete(
  "/:id",
  requireAuth,
  validate(
    deleteScanSchema,
    "INVALID_SCAN_ID",
    "Invalid scan ID"
  ),
  deleteScan
);

export default router;
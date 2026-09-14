import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  recordScan,
  getScanHistory,
  removeScan,
} from "../services/scan.service.js";

import {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

export const createScan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedRequest =
      req as AuthenticatedRequest;

    const scan = await recordScan({
      userId: authenticatedRequest.user.id,
      productId: req.body.productId,
      scannedCode: req.body.scannedCode,
    });

    return res.status(201).json({
      data: {
        scan,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedRequest =
      req as AuthenticatedRequest;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const result = await getScanHistory(
      authenticatedRequest.user.id,
      page,
      limit
    );

    const totalPages =
      Math.ceil(result.total / limit);

    return res.status(200).json({
      data: {
        scans: result.scans,
      },
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteScan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authenticatedRequest =
      req as AuthenticatedRequest;

    const scanId = Number(req.params.id);

    await removeScan(
      scanId,
      authenticatedRequest.user.id
    );

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
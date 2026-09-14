import {
  createScan,
  findScansByUserId,
  deleteScanByIdAndUserId,
} from "../repositories/scan.repository.js";

import { AppError } from "../utils/app-error.js";

export const recordScan = async (data: {
  userId: number;
  productId: number;
  scannedCode: string;
}) => {
  return createScan({
    userId: data.userId,
    productId: data.productId,
    scannedCode: data.scannedCode,
  });
};

export const getScanHistory = async (
  userId: number,
  page: number,
  limit: number
) => {
  return findScansByUserId(
    userId,
    page,
    limit
  );
};

export const removeScan = async (
  scanId: number,
  userId: number
) => {
  const result =
    await deleteScanByIdAndUserId(
      scanId,
      userId
    );

  if (result.count === 0) {
    throw new AppError(
      404,
      "SCAN_NOT_FOUND",
      "Scan not found"
    );
  }

  return {
    success: true,
  };
};
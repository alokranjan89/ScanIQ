import { z } from "zod";

export const createScanSchema = z.object({
  body: z.object({
    productId: z
      .number()
      .int()
      .positive("Product ID must be a positive integer"),

    scannedCode: z
      .string()
      .trim()
      .min(1, "Scanned code is required")
      .max(50, "Scanned code is too long"),
  }),
});

export const scanHistorySchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),
  }),
});
export const deleteScanSchema = z.object({
  params: z.object({
    id: z.coerce
      .number()
      .int()
      .positive("Scan ID must be a positive integer"),
  }),
});
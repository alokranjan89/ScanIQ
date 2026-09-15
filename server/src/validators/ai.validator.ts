import { z } from "zod";

export const explainProductSchema = z.object({
  body: z.object({
    productId: z.coerce
      .number()
      .int()
      .positive("Product ID must be a positive integer"),
  }),
});
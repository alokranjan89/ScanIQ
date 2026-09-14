import { z } from "zod";

export const favoriteProductSchema = z.object({
  params: z.object({
    productId: z.coerce
      .number()
      .int()
      .positive("Product ID must be a positive integer"),
  }),
});
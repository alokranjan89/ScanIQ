import { z } from "zod";

export const productSearchSchema = z.object({
  query: z.object({
    q: z
      .string()
      .trim()
      .min(1, "Search query is required")
      .max(100, "Search query is too long"),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .default(20),
  }),
});
import { z } from "zod";

export const explainProductSchema = z.object({
    body: z.object({
        productId: z.coerce
            .number()
            .int()
            .positive(
                "Product ID must be a positive integer",
            ),

        question: z
            .string()
            .trim()
            .min(
                1,
                "Question is required",
            )
            .max(
                500,
                "Question must be at most 500 characters",
            ),
    }),
});
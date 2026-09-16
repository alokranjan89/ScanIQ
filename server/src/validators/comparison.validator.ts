import { z } from "zod";

export const compareProductsSchema = z.object({
    query: z.object({
        productId1: z.coerce
            .number()
            .int()
            .positive(
                "Product ID 1 must be a positive integer",
            ),

        productId2: z.coerce
            .number()
            .int()
            .positive(
                "Product ID 2 must be a positive integer",
            ),
    }),
});
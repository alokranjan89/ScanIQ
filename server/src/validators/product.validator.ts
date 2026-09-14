import { z } from "zod";

export const productBarcodeSchema = z.object({
    params: z.object({
        barcode: z
            .string()
            .trim()
            .regex(/^\d+$/, "Barcode must contain only digits")
            .refine(
                (value) => [8, 12, 13].includes(value.length),
                "Barcode must be 8, 12, or 13 digits"
            ),
    }),
});
import { z } from "zod";

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address")
    .max(254, "Email is too long");

const passwordSchema = z
    .string()
    .min(
        8,
        "Password must be at least 8 characters"
    )
    .max(
        128,
        "Password is too long"
    );

export const registerSchema = z.object({
    body: z.object({
        email: emailSchema,

        password: passwordSchema,

        name: z
            .string()
            .trim()
            .min(
                2,
                "Name must be at least 2 characters"
            )
            .max(
                100,
                "Name is too long"
            )
            .optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: emailSchema,

        password: z
            .string()
            .min(
                1,
                "Password is required"
            )
            .max(
                128,
                "Password is too long"
            ),
    }),
});
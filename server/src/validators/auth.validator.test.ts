import assert from "node:assert/strict";
import test from "node:test";

import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    deleteAccountSchema,
} from "./auth.validator.js";

test(
    "registerSchema accepts valid registration data",
    () => {
        const result =
            registerSchema.safeParse({
                body: {
                    email:
                        "USER@EXAMPLE.COM",

                    password:
                        "StrongPassword123!",

                    name:
                        "Alok",
                },
            });

        assert.equal(
            result.success,
            true
        );

        if (result.success) {
            assert.equal(
                result.data.body.email,
                "user@example.com"
            );
        }
    }
);

test("password reset and account deletion schemas validate input", () => {
    assert.equal(
        forgotPasswordSchema.safeParse({ body: { email: "USER@example.com" } }).success,
        true,
    );
    assert.equal(
        resetPasswordSchema.safeParse({
            body: { token: "a".repeat(43), password: "NewStrongPassword123!" },
        }).success,
        true,
    );
    assert.equal(
        resetPasswordSchema.safeParse({
            body: { token: "invalid", password: "short" },
        }).success,
        false,
    );
    assert.equal(
        deleteAccountSchema.safeParse({ body: { password: "current-password" } }).success,
        true,
    );
});

test(
    "registerSchema rejects invalid email",
    () => {
        const result =
            registerSchema.safeParse({
                body: {
                    email:
                        "not-an-email",

                    password:
                        "StrongPassword123!",
                },
            });

        assert.equal(
            result.success,
            false
        );
    }
);

test(
    "registerSchema rejects short password",
    () => {
        const result =
            registerSchema.safeParse({
                body: {
                    email:
                        "user@example.com",

                    password:
                        "short",
                },
            });

        assert.equal(
            result.success,
            false
        );
    }
);

test(
    "registerSchema accepts registration without name",
    () => {
        const result =
            registerSchema.safeParse({
                body: {
                    email:
                        "user@example.com",

                    password:
                        "StrongPassword123!",
                },
            });

        assert.equal(
            result.success,
            true
        );
    }
);

test(
    "loginSchema accepts valid credentials",
    () => {
        const result =
            loginSchema.safeParse({
                body: {
                    email:
                        "USER@EXAMPLE.COM",

                    password:
                        "StrongPassword123!",
                },
            });

        assert.equal(
            result.success,
            true
        );

        if (result.success) {
            assert.equal(
                result.data.body.email,
                "user@example.com"
            );
        }
    }
);

test(
    "loginSchema rejects missing password",
    () => {
        const result =
            loginSchema.safeParse({
                body: {
                    email:
                        "user@example.com",
                },
            });

        assert.equal(
            result.success,
            false
        );
    }
);

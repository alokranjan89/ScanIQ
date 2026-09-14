import assert from "node:assert/strict";
import test from "node:test";

import {
    registerSchema,
    loginSchema,
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
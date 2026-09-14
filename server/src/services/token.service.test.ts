import assert from "node:assert/strict";
import test from "node:test";
import "dotenv/config";

import {
    generateAccessToken,
    verifyAccessToken,
} from "./token.service.js";

test(
    "generateAccessToken creates a JWT",
    () => {
        const token =
            generateAccessToken(123);

        assert.equal(
            typeof token,
            "string"
        );

        assert.ok(
            token.length > 0
        );

        assert.equal(
            token.split(".").length,
            3
        );
    }
);

test(
    "verifyAccessToken returns the user id",
    () => {
        const token =
            generateAccessToken(123);

        const payload =
            verifyAccessToken(token);

        assert.deepEqual(
            payload,
            {
                userId: 123,
            }
        );
    }
);

test(
    "verifyAccessToken rejects an invalid token",
    () => {
        assert.throws(
            () =>
                verifyAccessToken(
                    "invalid.token.value"
                )
        );
    }
);

test(
    "verifyAccessToken rejects a modified token",
    () => {
        const token =
            generateAccessToken(123);

        const parts =
            token.split(".");

        parts[1] =
            parts[1] + "modified";

        const modifiedToken =
            parts.join(".");

        assert.throws(
            () =>
                verifyAccessToken(
                    modifiedToken
                )
        );
    }
);
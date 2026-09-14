import assert from "node:assert/strict";
import test from "node:test";

import {
    hashPassword,
    comparePassword,
} from "./password.service.js";

test(
    "hashPassword creates a hash different from the original password",
    async () => {
        const password =
            "StrongPassword123!";

        const hash =
            await hashPassword(password);

        assert.notEqual(
            hash,
            password
        );

        assert.ok(
            hash.length > 0
        );
    }
);

test(
    "comparePassword returns true for the correct password",
    async () => {
        const password =
            "StrongPassword123!";

        const hash =
            await hashPassword(password);

        const result =
            await comparePassword(
                password,
                hash
            );

        assert.equal(
            result,
            true
        );
    }
);

test(
    "comparePassword returns false for an incorrect password",
    async () => {
        const password =
            "StrongPassword123!";

        const hash =
            await hashPassword(password);

        const result =
            await comparePassword(
                "WrongPassword123!",
                hash
            );

        assert.equal(
            result,
            false
        );
    }
);

test(
    "hashPassword produces different hashes for the same password",
    async () => {
        const password =
            "StrongPassword123!";

        const firstHash =
            await hashPassword(password);

        const secondHash =
            await hashPassword(password);

        assert.notEqual(
            firstHash,
            secondHash
        );

        assert.equal(
            await comparePassword(
                password,
                firstHash
            ),
            true
        );

        assert.equal(
            await comparePassword(
                password,
                secondHash
            ),
            true
        );
    }
);
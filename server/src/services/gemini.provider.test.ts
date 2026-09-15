import test from "node:test";
import assert from "node:assert/strict";

import { geminiProvider } from "./gemini.provider.js";

test(
    "Gemini provider returns generated text",
    { skip: process.env.RUN_GEMINI_INTEGRATION_TESTS !== "true" },
    async () => {
        const result = await geminiProvider.generateText(
            "Reply with exactly: ScanIQ test successful"
        );

        assert.equal(typeof result, "string");
        assert.ok(result.length > 0);
    }
);
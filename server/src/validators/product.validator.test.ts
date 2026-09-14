import assert from "node:assert/strict";
import test from "node:test";
import { productBarcodeSchema } from "./product.validator.js";

test("accepts supported numeric barcode lengths", () => {
    for (const barcode of [
        "12345678",
        "123456789012",
        "1234567890123",
    ]) {
        assert.equal(
            productBarcodeSchema.safeParse({
                params: { barcode },
            }).success,
            true
        );
    }
});

test("rejects unsupported barcode values", () => {
    for (const barcode of [
        "1234567",
        "123456789",
        "12345678901234",
        "ABC12345",
    ]) {
        assert.equal(
            productBarcodeSchema.safeParse({
                params: { barcode },
            }).success,
            false
        );
    }
});

import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../app.js";

test("GET /api/v1/products/barcode/:barcode returns a product", async () => {
    const response = await request(app)
        .get(
            "/api/v1/products/barcode/012993441012",
        )
        .expect("Content-Type", /json/)
        .expect(200);

    assert.ok(response.body.data);

    assert.equal(
        response.body.data.barcode,
        "012993441012",
    );

    assert.ok(
        typeof response.body.data.name === "string",
    );

    assert.ok(
        response.body.data.name.length > 0,
    );
});
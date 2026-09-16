import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";

import app from "../app.js";

test("GET /api/v1/health returns healthy status", async () => {
    const response = await request(app)
        .get("/api/v1/health")
        .expect("Content-Type", /json/)
        .expect(200);

    assert.equal(
        response.body.status,
        "ok",
    );
    assert.equal(
        response.body.services.database,
        "ok",
    );
    assert.equal(
        response.body.services.redis,
        "ok",
    );
});
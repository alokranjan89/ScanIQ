import test from "node:test";
import assert from "node:assert/strict";

import { errorMiddleware } from "./middleware/error.middleware.js";

test("returns INVALID_JSON for malformed JSON", () => {
  const error = Object.assign(
    new SyntaxError("Unexpected token"),
    {
      type: "entity.parse.failed",
    }
  );

  const response = {
    statusCode: 0,
    body: null as unknown,

    status(code: number) {
      this.statusCode = code;
      return this;
    },

    json(body: unknown) {
      this.body = body;
      return this;
    },
  };

  errorMiddleware(
    error,
    {} as any,
    response as any
  );

  assert.equal(
    response.statusCode,
    400
  );

  assert.deepEqual(
    response.body,
    {
      error: {
        code: "INVALID_JSON",
        message: "Invalid JSON request body",
      },
    }
  );
});
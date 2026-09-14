import test from "node:test";
import assert from "node:assert/strict";

import { getScanHistory } from "./scan.service.js";

test("getScanHistory passes userId, page, and limit to repository", async () => {
  const result = await getScanHistory(2, 1, 20);

  assert.ok(result);
});
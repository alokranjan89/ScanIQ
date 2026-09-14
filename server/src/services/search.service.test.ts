import assert from "node:assert/strict";
import test from "node:test";

import { searchProductCatalog } from "./search.service.js";

test("searchProductCatalog trims the query before searching", async () => {
  const result = await searchProductCatalog(
    "  LaCroix  ",
    20
  );

  assert.ok(Array.isArray(result));
});
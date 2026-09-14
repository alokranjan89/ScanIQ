import assert from "node:assert/strict";
import test from "node:test";
import { parseIngredients } from "./ingredient-parser.js";

test("parses comma-separated ingredients and removes contains clauses", () => {
    assert.deepEqual(
        parseIngredients(
            "Wheat Flour, Sugar, Cocoa Powder. Contains milk and soy."
        ),
        [
            { name: "Wheat Flour" },
            { name: "Sugar" },
            { name: "Cocoa Powder" },
        ]
    );
});

test("returns an empty list for missing or empty ingredients", () => {
    assert.deepEqual(parseIngredients(), []);
    assert.deepEqual(parseIngredients("   "), []);
});

import test from "node:test";
import assert from "node:assert/strict";

import { explainProduct } from "./ai.service.js";

test("explainProduct uses the provided AI provider", async () => {
    let receivedPrompt = "";

    const fakeProvider = {
        generateText: async (prompt: string) => {
            receivedPrompt = prompt;

            return "Mock AI explanation";
        },
    };

    const result = await explainProduct(
        {
            name: "LaCroix Enhanced Sparkling Water Passionfruit - 12 fl oz",
            brand: "LaCroix",
            category: "Carbonated Water",
            description: "Passionfruit sparkling water",
            barcode: "012993441012",
            modelNumber: null,

            ingredients: [
                {
                    name: "Carbonated water",
                    description: null,
                },
                {
                    name: "Natural flavor",
                    description: null,
                },
            ],

            nutrition: {
                calories: 0,
                protein: 0,
                carbohydrates: 0,
                fat: 0,
                saturatedFat: null,
                sugars: null,
                fiber: null,
                salt: 0,
                sodium: 0,
                unit: "per_100g",
            },
        },
        fakeProvider
    );

    assert.equal(result, "Mock AI explanation");

    assert.match(
        receivedPrompt,
        /LaCroix/
    );

    assert.match(
        receivedPrompt,
        /Carbonated water/
    );

    assert.match(
        receivedPrompt,
        /Use ONLY the product data provided below/
    );
});
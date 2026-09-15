import assert from "node:assert/strict";
import test from "node:test";

import {
    OpenFoodFactsProvider,
} from "./openfoodfacts.provider.js";

import {
    ProviderError,
} from "../utils/provider-error.js";

test(
    "Open Food Facts maps product data correctly",
    async () => {
        const originalFetch =
            globalThis.fetch;

        const mockResponse = {
            status: 1,

            product: {
                product_name:
                    " Test Food ",

                brands:
                    " Test Brand ",

                categories:
                    "Food, Snacks",

                generic_name:
                    "Test snack",

                image_url:
                    "https://example.com/image.jpg",

                manufacturers:
                    "Test Manufacturer",

                countries:
                    "United States",

                ingredients_text:
                    "Sugar, Cocoa (contains milk), Salt",

                packaging:
                    "Aluminium-can",

                quantity:
                    "500 g",

                allergens:
                    "en:milk",

                traces:
                    "en:nuts",

                nutriscore_grade:
                    "b",

                nova_group:
                    4,

                stores:
                    "Target",

                nutriments: {
                    "energy-kcal_100g":
                        100,

                    proteins_100g:
                        2,

                    carbohydrates_100g:
                        20,

                    fat_100g:
                        3,

                    "saturated-fat_100g":
                        1,

                    sugars_100g:
                        10,

                    fiber_100g:
                        2,

                    salt_100g:
                        0.5,

                    sodium_100g:
                        0.2,
                },
            },
        };

        globalThis.fetch = async () => {
            return new Response(
                JSON.stringify(
                    mockResponse
                )
            );
        };

        try {
            const provider =
                new OpenFoodFactsProvider();

            const product =
                await provider.getProductByBarcode(
                    "12345678"
                );

            assert.ok(product);

            assert.equal(
                product.barcode,
                "12345678"
            );

            assert.equal(
                product.name,
                "Test Food"
            );

            assert.equal(
                product.brand,
                "Test Brand"
            );

            assert.equal(
                product.category,
                "Food, Snacks"
            );

            assert.equal(
                product.description,
                "Test snack"
            );

            assert.equal(
                product.imageUrl,
                "https://example.com/image.jpg"
            );

            assert.equal(
                product.manufacturer,
                "Test Manufacturer"
            );

            assert.equal(
                product.country,
                "United States"
            );

            assert.deepEqual(
                product.ingredients,
                [
                    {
                        name: "Sugar",
                    },
                    {
                        name: "Cocoa",
                    },
                    {
                        name: "Salt",
                    },
                ]
            );

            assert.deepEqual(
                product.attributes,
                {
                    packaging:
                        "Aluminium-can",

                    package_size:
                        "500 g",

                    generic_name:
                        "Test snack",

                    allergens:
                        "en:milk",

                    traces:
                        "en:nuts",

                    nutri_score:
                        "B",

                    nova_group:
                        "4",

                    stores:
                        "Target",
                }
            );

            assert.deepEqual(
                product.nutrition,
                {
                    calories:
                        100,

                    protein:
                        2,

                    carbohydrates:
                        20,

                    fat:
                        3,

                    saturatedFat:
                        1,

                    sugars:
                        10,

                    fiber:
                        2,

                    salt:
                        0.5,

                    sodium:
                        0.2,

                    unit:
                        "per_100g",

                    source:
                        "OpenFoodFacts",
                }
            );

            assert.equal(
                product.source,
                "OpenFoodFacts"
            );

            assert.equal(
                product.sourceUrl,
                "https://world.openfoodfacts.org/product/12345678"
            );

            assert.deepEqual(
                product.sources,
                [
                    {
                        provider:
                            "OpenFoodFacts",

                        sourceUrl:
                            "https://world.openfoodfacts.org/product/12345678",

                        rawData:
                            mockResponse,

                        isPrimary:
                            true,
                    },
                ]
            );
        } finally {
            globalThis.fetch =
                originalFetch;
        }
    }
);

test(
    "Open Food Facts returns null when product is not found",
    async () => {
        const originalFetch =
            globalThis.fetch;

        globalThis.fetch = async () => {
            return new Response(
                JSON.stringify({
                    status: 0,
                })
            );
        };

        try {
            const provider =
                new OpenFoodFactsProvider();

            const product =
                await provider.getProductByBarcode(
                    "12345678"
                );

            assert.equal(
                product,
                null
            );
        } finally {
            globalThis.fetch =
                originalFetch;
        }
    }
);

test(
    "Open Food Facts converts invalid JSON into ProviderError",
    async () => {
        const originalFetch =
            globalThis.fetch;

        globalThis.fetch = async () => {
            return new Response(
                "invalid json",
                {
                    status: 200,

                    headers: {
                        "content-type":
                            "application/json",
                    },
                }
            );
        };

        try {
            const provider =
                new OpenFoodFactsProvider();

            await assert.rejects(
                () =>
                    provider.getProductByBarcode(
                        "12345678"
                    ),

                (error: unknown) => {
                    assert.ok(
                        error instanceof
                            ProviderError
                    );

                    assert.equal(
                        error.provider,
                        "OpenFoodFacts"
                    );

                    assert.equal(
                        error.message,
                        "Open Food Facts returned invalid JSON"
                    );

                    return true;
                }
            );
        } finally {
            globalThis.fetch =
                originalFetch;
        }
    }
);
import assert from "node:assert/strict";
import test from "node:test";

import { UPCItemDBProvider } from "./upcitemdb.provider.js";
import { ProviderError } from "../utils/provider-error.js";

test("UPCitemdb maps product data correctly", async () => {
    const originalFetch = globalThis.fetch;

    const mockResponse = {
        code: "OK",
        total: 1,
        items: [
            {
                title: " Test Product ",
                brand: " Test Brand ",
                category: "Food",
                description: " Test description ",
                images: [
                    " https://example.com/image.jpg ",
                ],
                manufacturer: "Manufacturer",
                country: "US",
                model: "MODEL-123",
                color: "Red",
                size: "500g",
                dimension: "10x10x10",
                weight: "500g",
                offers: [
                    {
                        merchant: "Shop",
                        currency: "USD",
                        availability: "In Stock",
                        price: 10,
                        list_price: 15,
                    },
                ],
            },
        ],
    };

    globalThis.fetch = async () => {
        return new Response(
            JSON.stringify(mockResponse)
        );
    };

    try {
        const provider =
            new UPCItemDBProvider();

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
            "Test Product"
        );

        assert.equal(
            product.brand,
            "Test Brand"
        );

        assert.equal(
            product.category,
            "Food"
        );

        assert.equal(
            product.imageUrl,
            "https://example.com/image.jpg"
        );

        assert.equal(
            product.manufacturer,
            "Manufacturer"
        );

        assert.equal(
            product.country,
            "US"
        );

        assert.deepEqual(
            product.attributes,
            {
                model: "MODEL-123",
                color: "Red",
                size: "500g",
                dimension: "10x10x10",
                weight: "500g",
            }
        );

        assert.deepEqual(
            product.prices,
            [
                {
                    amount: 10,
                    priceType: "SALE",
                    currency: "USD",
                    merchant: "Shop",
                    source: "UPCitemdb",
                    availability: "In Stock",
                },
                {
                    amount: 15,
                    priceType: "LIST",
                    currency: "USD",
                    merchant: "Shop",
                    source: "UPCitemdb",
                    availability: "In Stock",
                },
            ]
        );

        assert.equal(
            product.source,
            "UPCitemdb"
        );

        assert.equal(
            product.sourceUrl,
            "https://www.upcitemdb.com/upc/12345678"
        );

        assert.deepEqual(
            product.sources,
            [
                {
                    provider: "UPCitemdb",

                    sourceUrl:
                        "https://www.upcitemdb.com/upc/12345678",

                    rawData: mockResponse,

                    isPrimary: true,
                },
            ]
        );
    } finally {
        globalThis.fetch =
            originalFetch;
    }
});

test("UPCitemdb returns null when no product exists", async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => {
        return new Response(
            JSON.stringify({
                code: "OK",
                total: 0,
                items: [],
            })
        );
    };

    try {
        const provider =
            new UPCItemDBProvider();

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
});

test("UPCitemdb converts invalid JSON into ProviderError", async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () => {
        return new Response(
            "not valid json",
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
            new UPCItemDBProvider();

        await assert.rejects(
            () =>
                provider.getProductByBarcode(
                    "12345678"
                ),
            (error: unknown) => {
                assert.ok(
                    error instanceof ProviderError
                );

                assert.equal(
                    error.provider,
                    "UPCitemdb"
                );

                assert.equal(
                    error.message,
                    "UPCitemdb returned invalid JSON"
                );

                return true;
            }
        );
    } finally {
        globalThis.fetch =
            originalFetch;
    }
});
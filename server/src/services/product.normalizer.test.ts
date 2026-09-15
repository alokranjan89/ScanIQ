import assert from "node:assert/strict";
import test from "node:test";
import { normalizeProduct } from "./product.normalizer.js";

test(
    "normalizes product strings, attributes, prices, and sources",
    () => {
        const rawData = {
            items: [
                {
                    ean: "12345678",
                    title: "Test Product",
                    brand: "Brand",
                },
            ],
        };

        assert.deepEqual(
            normalizeProduct({
                barcode: " 12345678 ",
                name: " Test Product ",
                brand: " Brand ",

                attributes: {
                    " model ": " X1 ",
                    empty: " ",
                },

                prices: [
                    {
                        amount: 10,
                        priceType: "SALE",
                        currency: " usd ",
                        merchant: " Shop ",
                    },
                    {
                        amount: -1,
                        priceType: "SALE",
                        currency: "USD",
                    },
                ],

                sources: [
                    {
                        provider: " UPCitemdb ",
                        sourceUrl:
                            " https://example.com ",
                        rawData,
                        isPrimary: true,
                    },
                    {
                        provider: "UPCitemdb",
                        sourceUrl:
                            "https://duplicate.example",
                    },
                ],
            }),
            {
                barcode: "12345678",
                name: "Test Product",
                brand: "Brand",

                category: undefined,
                description: undefined,
                imageUrl: undefined,
                manufacturer: undefined,
                country: undefined,

                source: "UPCitemdb",
                sourceUrl:
                    "https://example.com",

                sources: [
                    {
                        provider: "UPCitemdb",
                        sourceUrl:
                            "https://example.com",
                        rawData,
                        isPrimary: true,
                    },
                ],

                ingredients: undefined,

                attributes: {
                    model: "X1",
                },

                prices: [
                    {
                        amount: 10,
                        priceType: "SALE",
                        currency: "USD",
                        merchant: "Shop",
                        source: undefined,
                        availability: undefined,
                    },
                ],

                nutrition: undefined,
            }
        );
    }
);
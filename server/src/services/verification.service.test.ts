import test from "node:test";
import assert from "node:assert/strict";

import {
    verifyProduct,
} from "./verification.service.js";

type FakeSource = {
    provider: string;
    sourceUrl: string | null;
    isPrimary: boolean;
    rawData: unknown;
};

type FakeProduct = {
    id: number;
    barcode: string;
    name: string;
    brand: string | null;
    category: string | null;
    manufacturer: string | null;
    country: string | null;
    modelNumber: string | null;
    sources: FakeSource[];
};

type FakeRepository = {
    findProductById: (
        productId: number,
    ) => Promise<FakeProduct | null>;
};

const createRepository = (
    product: FakeProduct | null,
): FakeRepository => {
    return {
        findProductById: async () =>
            product,
    };
};

const createProduct = (
    sources: FakeSource[],
): FakeProduct => {
    return {
        id: 1,
        barcode: "012993441012",
        name: "LaCroix Sparkling Water",
        brand: "LaCroix",
        category: "Beverages",
        manufacturer: "National Beverage Corp",
        country: "United States",
        modelNumber: null,
        sources,
    };
};

const createUPCSource = (
    overrides: Record<string, unknown> = {},
): FakeSource => {
    return {
        provider: "UPCitemdb",
        sourceUrl:
            "https://www.upcitemdb.com/",
        isPrimary: true,
        rawData: {
            items: [
                {
                    ean: "012993441012",
                    upc: "012993441012",
                    title:
                        "LaCroix Sparkling Water",
                    brand: "LaCroix",
                    category: "Beverages",
                    manufacturer:
                        "National Beverage Corp",
                    country: "United States",
                    model: undefined,
                    ...overrides,
                },
            ],
        },
    };
};

const createOFFSource = (
    overrides: Record<string, unknown> = {},
): FakeSource => {
    return {
        provider: "OpenFoodFacts",
        sourceUrl:
            "https://world.openfoodfacts.org/",
        isPrimary: false,
        rawData: {
            product: {
                code: "012993441012",
                product_name:
                    "LaCroix Sparkling Water",
                brands: "LaCroix",
                categories: "Beverages",
                manufacturers:
                    "National Beverage Corp",
                countries: "United States",
                ...overrides,
            },
        },
    };
};

/**
 * ----------------------------------------
 * Product not found
 * ----------------------------------------
 */
test(
    "verifyProduct throws PRODUCT_NOT_FOUND when product does not exist",
    async () => {
        const repository =
            createRepository(null);

        await assert.rejects(
            () =>
                verifyProduct(
                    999,
                    repository,
                ),
            (error: unknown) => {
                return (
                    error instanceof Error &&
                    error.message ===
                        "PRODUCT_NOT_FOUND"
                );
            },
        );
    },
);

/**
 * ----------------------------------------
 * No sources
 * ----------------------------------------
 */
test(
    "verifyProduct returns UNKNOWN checks when no sources exist",
    async () => {
        const product =
            createProduct([]);

        const repository =
            createRepository(product);

        const result =
            await verifyProduct(
                1,
                repository,
            );

        assert.equal(
            result.status,
            "UNABLE_TO_VERIFY",
        );

        assert.equal(
            result.verified,
            false,
        );

        assert.equal(
            result.sourceCount,
            0,
        );

        assert.equal(
            result.checks.barcodeMatch,
            "UNKNOWN",
        );

        assert.equal(
            result.checks.nameAgreement,
            "UNKNOWN",
        );

        assert.equal(
            result.checks.brandAgreement,
            "UNKNOWN",
        );

        assert.equal(
            result.checks.categoryAgreement,
            "UNKNOWN",
        );
    },
);

/**
 * ----------------------------------------
 * One source
 * ----------------------------------------
 */
test(
    "verifyProduct returns UNKNOWN checks when only one source exists",
    async () => {
        const product =
            createProduct([
                createUPCSource(),
            ]);

        const repository =
            createRepository(product);

        const result =
            await verifyProduct(
                1,
                repository,
            );

        assert.equal(
            result.status,
            "PARTIALLY_VERIFIED",
        );

        assert.equal(
            result.verified,
            false,
        );

        assert.equal(
            result.sourceCount,
            1,
        );

        assert.equal(
            result.checks.barcodeMatch,
            "UNKNOWN",
        );

        assert.equal(
            result.checks.nameAgreement,
            "UNKNOWN",
        );

        assert.equal(
            result.checks.brandAgreement,
            "UNKNOWN",
        );

        assert.match(
            result.message,
            /one product source/i,
        );
    },
);

/**
 * ----------------------------------------
 * Two agreeing sources
 * ----------------------------------------
 */
test(
    "verifyProduct returns VERIFIED when two sources agree",
    async () => {
        const product =
            createProduct([
                createUPCSource(),
                createOFFSource(),
            ]);

        const repository =
            createRepository(product);

        const result =
            await verifyProduct(
                1,
                repository,
            );

        assert.equal(
            result.status,
            "VERIFIED",
        );

        assert.equal(
            result.verified,
            true,
        );

        assert.equal(
            result.sourceCount,
            2,
        );

        assert.equal(
            result.checks.barcodeMatch,
            "MATCH",
        );

        assert.equal(
            result.checks.nameAgreement,
            "MATCH",
        );

        assert.equal(
            result.checks.brandAgreement,
            "MATCH",
        );

        assert.equal(
            result.checks.categoryAgreement,
            "MATCH",
        );

        assert.equal(
            result.checks.manufacturerAgreement,
            "MATCH",
        );

        assert.equal(
            result.checks.countryAgreement,
            "MATCH",
        );
    },
);

/**
 * ----------------------------------------
 * Mismatch
 * ----------------------------------------
 */
test(
    "verifyProduct marks conflicting source fields as MISMATCH",
    async () => {
        const product =
            createProduct([
                createUPCSource({
                    title:
                        "LaCroix Sparkling Water",
                    brand: "LaCroix",
                }),

                createOFFSource({
                    product_name:
                        "Different Sparkling Water",
                    brands: "Different Brand",
                }),
            ]);

        const repository =
            createRepository(product);

        const result =
            await verifyProduct(
                1,
                repository,
            );

        assert.equal(
            result.checks.nameAgreement,
            "MISMATCH",
        );

        assert.equal(
            result.checks.brandAgreement,
            "MISMATCH",
        );

        assert.equal(
            result.status,
            "PARTIALLY_VERIFIED",
        );

        assert.equal(
            result.verified,
            false,
        );
    },
);

/**
 * ----------------------------------------
 * Unknown field
 * ----------------------------------------
 */
test(
    "verifyProduct returns UNKNOWN when a field is missing from sources",
    async () => {
        const product =
            createProduct([
                createUPCSource({
                    title:
                        "LaCroix Sparkling Water",
                    manufacturer:
                        undefined,
                }),

                createOFFSource({
                    product_name:
                        "LaCroix Sparkling Water",
                    manufacturers:
                        undefined,
                }),
            ]);

        const repository =
            createRepository(product);

        const result =
            await verifyProduct(
                1,
                repository,
            );

        assert.equal(
            result.checks.nameAgreement,
            "MATCH",
        );

        assert.equal(
            result.checks.manufacturerAgreement,
            "UNKNOWN",
        );
    },
);

/**
 * ----------------------------------------
 * Barcode mismatch
 * ----------------------------------------
 */
test(
    "verifyProduct marks different source barcodes as MISMATCH",
    async () => {
        const product =
            createProduct([
                createUPCSource({
                    ean: "012993441012",
                    upc: "012993441012",
                }),

                createOFFSource({
                    code: "999999999999",
                }),
            ]);

        const repository =
            createRepository(product);

        const result =
            await verifyProduct(
                1,
                repository,
            );

        assert.equal(
            result.checks.barcodeMatch,
            "MISMATCH",
        );

        assert.equal(
            result.verified,
            false,
        );
    },
);

/**
 * ----------------------------------------
 * Case and whitespace normalization
 * ----------------------------------------
 */
test(
    "verifyProduct treats case and whitespace differences as MATCH",
    async () => {
        const product =
            createProduct([
                createUPCSource({
                    title:
                        "  LaCroix   Sparkling Water ",
                    brand:
                        "  LACROIX ",
                }),

                createOFFSource({
                    product_name:
                        "lacroix sparkling water",
                    brands: "LaCroix",
                }),
            ]);

        const repository =
            createRepository(product);

        const result =
            await verifyProduct(
                1,
                repository,
            );

        assert.equal(
            result.checks.nameAgreement,
            "MATCH",
        );

        assert.equal(
            result.checks.brandAgreement,
            "MATCH",
        );
    },
);
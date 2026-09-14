import assert from "node:assert/strict";
import test, { after } from "node:test";

import {
    getProductByBarcode,
    productServiceDependencies,
    refreshProductByBarcode,
} from "./product.service.js";
import redis from "../config/redis.js";

after(() => {
    redis.disconnect();
});

const originalDependencies = { ...productServiceDependencies };

const restoreDependencies = () => {
    Object.assign(productServiceDependencies, originalDependencies);
};

test("getProductByBarcode returns cached product without querying database", async () => {
    const cachedProduct = {
        id: 1,
        barcode: "12345678",
        name: "Cached Product",
    };
    let databaseCalled = false;

    productServiceDependencies.getJsonCache = async () => ({
        hit: true,
        value: cachedProduct,
    }) as never;
    productServiceDependencies.findProductByBarcode = async () => {
        databaseCalled = true;
        return null;
    };

    try {
        assert.deepEqual(await getProductByBarcode("12345678"), cachedProduct);
        assert.equal(databaseCalled, false);
    } finally {
        restoreDependencies();
    }
});

test("getProductByBarcode returns database product and caches it", async () => {
    const databaseProduct = {
        id: 1,
        barcode: "12345678",
        name: "Database Product",
    };
    let cached = false;

    productServiceDependencies.getJsonCache = async () => ({
        hit: false,
        value: null,
    }) as never;
    productServiceDependencies.findProductByBarcode = async () =>
        databaseProduct as never;
    productServiceDependencies.setJsonCache = async () => {
        cached = true;
    };

    try {
        assert.deepEqual(await getProductByBarcode("12345678"), databaseProduct);
        assert.equal(cached, true);
    } finally {
        restoreDependencies();
    }
});

test("getProductByBarcode throws EXTERNAL_API_FAILURE when providers fail", async () => {
    productServiceDependencies.getJsonCache = async () => ({
        hit: false,
        value: null,
    }) as never;
    productServiceDependencies.findProductByBarcode = async () => null;
    productServiceDependencies.generalProvider = {
        getProductByBarcode: async () => {
            throw new Error("Provider unavailable");
        },
    };
    productServiceDependencies.foodProvider = {
        getProductByBarcode: async () => {
            throw new Error("Provider unavailable");
        },
    };

    try {
        await assert.rejects(
            () => getProductByBarcode("12345678"),
            (error: unknown) => {
                assert.equal((error as { code: string }).code, "EXTERNAL_API_FAILURE");
                assert.equal((error as { statusCode: number }).statusCode, 503);
                return true;
            }
        );
    } finally {
        restoreDependencies();
    }
});

test("refreshProductByBarcode deletes cache before fetching fresh product", async () => {
    let cacheDeleted = false;

    productServiceDependencies.deleteCache = async () => {
        cacheDeleted = true;
    };
    productServiceDependencies.getJsonCache = async () => ({
        hit: false,
        value: null,
    }) as never;
    productServiceDependencies.findProductByBarcode = async () => null;
    productServiceDependencies.generalProvider = {
        getProductByBarcode: async () => null,
    };
    productServiceDependencies.foodProvider = {
        getProductByBarcode: async () => null,
    };

    try {
        await assert.rejects(() => refreshProductByBarcode("12345678"));
        assert.equal(cacheDeleted, true);
    } finally {
        restoreDependencies();
    }
});

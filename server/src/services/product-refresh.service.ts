import { deleteCache, getJsonCache } from "./redis.service.js";
import { productCacheKey } from "../utils/cache-key.js";
import { fetchFreshProduct } from "./product.service.js";

export const productRefreshDependencies = {
    getJsonCache,
    deleteCache,
    fetchFreshProduct,
};

export const refreshProductByBarcode = async (barcode: string) => {
    const cacheKey = productCacheKey(barcode);
    const cachedProduct = await productRefreshDependencies.getJsonCache(cacheKey);

    if (cachedProduct.hit) {
        await productRefreshDependencies.deleteCache(cacheKey);
    }

    return productRefreshDependencies.fetchFreshProduct(barcode);
};
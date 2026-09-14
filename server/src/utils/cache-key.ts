export const productCacheKey = (
    barcode: string
): string => {
    return `product:barcode:${barcode}`;
};
export const isValidBarcode = (barcode: string): boolean => {
    if (!barcode) {
        return false;
    }

    const normalizedBarcode = barcode.trim();

    if (!/^\d+$/.test(normalizedBarcode)) {
        return false;
    }

    const validLengths = new Set([8, 12, 13]);

    return validLengths.has(normalizedBarcode.length);
};
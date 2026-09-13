export const isValidBarcode = (barcode: string): boolean => {
    if (!barcode) {
        return false;
    }

    if (!/^\d+$/.test(barcode)) {
        return false;
    }

    const validLengths = [8, 12, 13];

    return validLengths.includes(barcode.length);
};
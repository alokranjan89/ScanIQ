import { findProductById } from "../repositories/product.repository.js";

export type VerificationStatus =
    | "VERIFIED"
    | "PARTIALLY_VERIFIED"
    | "UNABLE_TO_VERIFY";

export type VerificationResult = {
    status: VerificationStatus;
    verified: boolean;
    sourceCount: number;

    sources: Array<{
        provider: string;
        sourceUrl: string | null;
        isPrimary: boolean;
    }>;

    checks: {
        barcodeMatch: boolean;
        nameAgreement: boolean;
        brandAgreement: boolean;
        categoryAgreement: boolean;
        manufacturerAgreement: boolean;
        countryAgreement: boolean;
        modelNumberAgreement: boolean;
    };

    message: string;
};

type SourceRawData = {
    items?: Array<{
        ean?: string;
        upc?: string;
        title?: string;
        brand?: string;
        category?: string;
        manufacturer?: string;
        country?: string;
        model?: string;
    }>;

    status?: number;

    product?: {
        code?: string;
        product_name?: string;
        brands?: string;
        categories?: string;
        manufacturers?: string;
        countries?: string;
    };
};

const normalize = (
    value: string | null | undefined
): string | null => {
    if (!value) {
        return null;
    }

    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
};

const valuesAgree = (
    values: Array<string | null | undefined>
): boolean => {
    const normalizedValues = values
        .map(normalize)
        .filter(
            (value): value is string =>
                value !== null
        );

    if (normalizedValues.length < 2) {
        return false;
    }

    return new Set(normalizedValues).size === 1;
};

const getSourceData = (
    rawData: unknown
): SourceRawData | null => {
    if (
        typeof rawData !== "object" ||
        rawData === null
    ) {
        return null;
    }

    return rawData as SourceRawData;
};

const extractSourceFields = (
    source: {
        provider: string;
        rawData: unknown;
    }
) => {
    const data = getSourceData(source.rawData);

    if (!data) {
        return {
            barcode: null,
            name: null,
            brand: null,
            category: null,
            manufacturer: null,
            country: null,
            modelNumber: null,
        };
    }

    if (source.provider === "UPCitemdb") {
        const item = data.items?.[0];

        return {
            barcode:
                item?.ean ??
                item?.upc ??
                null,

            name:
                item?.title ??
                null,

            brand:
                item?.brand ??
                null,

            category:
                item?.category ??
                null,

            manufacturer:
                item?.manufacturer ??
                null,

            country:
                item?.country ??
                null,

            modelNumber:
                item?.model ??
                null,
        };
    }

    if (source.provider === "OpenFoodFacts") {
        const product = data.product;

        return {
            barcode:
                product?.code ??
                null,

            name:
                product?.product_name ??
                null,

            brand:
                product?.brands ??
                null,

            category:
                product?.categories ??
                null,

            manufacturer:
                product?.manufacturers ??
                null,

            country:
                product?.countries ??
                null,

            modelNumber: null,
        };
    }

    return {
        barcode: null,
        name: null,
        brand: null,
        category: null,
        manufacturer: null,
        country: null,
        modelNumber: null,
    };
};

type ProductRepository = {
    findProductById: typeof findProductById;
};

export const verifyProduct = async (
    productId: number,
    repository: ProductRepository = {
        findProductById,
    }
): Promise<VerificationResult> => {
    const product =
        await repository.findProductById(productId);

    if (!product) {
        throw new Error(
            "PRODUCT_NOT_FOUND"
        );
    }

    const sources = product.sources;

    const sourceResponse = sources.map(
        (source) => ({
            provider:
                source.provider,

            sourceUrl:
                source.sourceUrl,

            isPrimary:
                source.isPrimary,
        })
    );

    if (sources.length === 0) {
        return {
            status:
                "UNABLE_TO_VERIFY",

            verified: false,

            sourceCount: 0,

            sources: [],

            checks: {
                barcodeMatch: false,
                nameAgreement: false,
                brandAgreement: false,
                categoryAgreement: false,
                manufacturerAgreement: false,
                countryAgreement: false,
                modelNumberAgreement: false,
            },

            message:
                "Unable to verify this product because no product sources are available.",
        };
    }

    /*
     * One source gives us product information,
     * but it is not enough for independent
     * cross-source verification.
     */
    if (sources.length < 2) {
        return {
            status:
                "PARTIALLY_VERIFIED",

            verified: false,

            sourceCount:
                sources.length,

            sources:
                sourceResponse,

            checks: {
                barcodeMatch: false,
                nameAgreement: false,
                brandAgreement: false,
                categoryAgreement: false,
                manufacturerAgreement: false,
                countryAgreement: false,
                modelNumberAgreement: false,
            },

            message:
                "Only one product source is available, so the product cannot be fully verified.",
        };
    }

    const extractedSources =
        sources.map(
            (source) =>
                extractSourceFields(source)
        );

    /*
     * Barcode verification.
     *
     * First check whether independent
     * sources agree with each other.
     *
     * If only one source contains a barcode,
     * compare that barcode against the
     * product barcode stored in our database.
     */
    const sourceBarcodes =
        extractedSources.map(
            (source) =>
                normalize(source.barcode)
        );

    const availableBarcodes =
        sourceBarcodes.filter(
            (barcode): barcode is string =>
                barcode !== null
        );

    const allSourcesMatchProductBarcode =
        availableBarcodes.length > 0 &&
        availableBarcodes.every(
            (barcode) =>
                barcode ===
                normalize(product.barcode)
        );

    const independentBarcodesAgree =
        valuesAgree(
            extractedSources.map(
                (source) =>
                    source.barcode
            )
        );

    const barcodeMatch =
        independentBarcodesAgree ||
        allSourcesMatchProductBarcode;

    /*
     * Compare identity fields across
     * independent sources.
     */
    const nameAgreement =
        valuesAgree(
            extractedSources.map(
                (source) =>
                    source.name
            )
        );

    const brandAgreement =
        valuesAgree(
            extractedSources.map(
                (source) =>
                    source.brand
            )
        );

    const categoryAgreement =
        valuesAgree(
            extractedSources.map(
                (source) =>
                    source.category
            )
        );

    const manufacturerAgreement =
        valuesAgree(
            extractedSources.map(
                (source) =>
                    source.manufacturer
            )
        );

    const countryAgreement =
        valuesAgree(
            extractedSources.map(
                (source) =>
                    source.country
            )
        );

    const modelNumberAgreement =
        valuesAgree(
            extractedSources.map(
                (source) =>
                    source.modelNumber
            )
        );

    /*
     * Core verification rule:
     *
     * Barcode must match and at least
     * two identity fields must agree.
     *
     * We NEVER claim that disagreement
     * means counterfeit.
     */
    const identityChecks = [
        barcodeMatch,
        nameAgreement,
        brandAgreement,
    ];

    const passedIdentityChecks =
        identityChecks.filter(
            Boolean
        ).length;

    const supportingChecks = [
        categoryAgreement,
        manufacturerAgreement,
        countryAgreement,
        modelNumberAgreement,
    ];

    const passedSupportingChecks =
        supportingChecks.filter(
            Boolean
        ).length;

    /*
     * Strong verification.
     */
    if (
        barcodeMatch &&
        passedIdentityChecks >= 2
    ) {
        return {
            status: "VERIFIED",

            verified: true,

            sourceCount:
                sources.length,

            sources:
                sourceResponse,

            checks: {
                barcodeMatch,
                nameAgreement,
                brandAgreement,
                categoryAgreement,
                manufacturerAgreement,
                countryAgreement,
                modelNumberAgreement,
            },

            message:
                "Product information is supported by multiple sources that agree on the product identity.",
        };
    }

    /*
     * Partial verification.
     */
    if (
        barcodeMatch ||
        passedIdentityChecks > 0 ||
        passedSupportingChecks > 0
    ) {
        return {
            status:
                "PARTIALLY_VERIFIED",

            verified: false,

            sourceCount:
                sources.length,

            sources:
                sourceResponse,

            checks: {
                barcodeMatch,
                nameAgreement,
                brandAgreement,
                categoryAgreement,
                manufacturerAgreement,
                countryAgreement,
                modelNumberAgreement,
            },

            message:
                "Some product information agrees across available sources, but there is not enough consistent evidence for full verification.",
        };
    }

    /*
     * Sources exist but do not provide
     * enough usable evidence.
     */
    return {
        status:
            "UNABLE_TO_VERIFY",

        verified: false,

        sourceCount:
            sources.length,

        sources:
            sourceResponse,

        checks: {
            barcodeMatch,
            nameAgreement,
            brandAgreement,
            categoryAgreement,
            manufacturerAgreement,
            countryAgreement,
            modelNumberAgreement,
        },

        message:
            "Available product sources do not provide enough consistent evidence to verify this product.",
    };
};
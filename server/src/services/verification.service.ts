import { findProductById } from "../repositories/product.repository.js";

export type VerificationStatus =
    | "VERIFIED"
    | "PARTIALLY_VERIFIED"
    | "UNABLE_TO_VERIFY";

export type VerificationCheck =
    | "MATCH"
    | "MISMATCH"
    | "UNKNOWN";

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
        barcodeMatch: VerificationCheck;
        nameAgreement: VerificationCheck;
        brandAgreement: VerificationCheck;
        categoryAgreement: VerificationCheck;
        manufacturerAgreement: VerificationCheck;
        countryAgreement: VerificationCheck;
        modelNumberAgreement: VerificationCheck;
    };

    message: string;
};

/**
 * Only the fields required by the verification service.
 *
 * This keeps the service independent from the complete
 * Prisma Product type and makes unit testing easier.
 */
type VerificationProduct = {
    barcode: string;

    sources: Array<{
        provider: string;
        sourceUrl: string | null;
        isPrimary: boolean;
        rawData: unknown;
    }>;
};

export type VerificationProductRepository = {
    findProductById(
        productId: number,
    ): Promise<VerificationProduct | null>;
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
    value: string | null | undefined,
): string | null => {
    if (!value) {
        return null;
    }

    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
};

const compareValues = (
    values: Array<string | null | undefined>,
): VerificationCheck => {
    const normalizedValues = values
        .map(normalize)
        .filter(
            (value): value is string =>
                value !== null,
        );

    if (normalizedValues.length < 2) {
        return "UNKNOWN";
    }

    return new Set(normalizedValues).size === 1
        ? "MATCH"
        : "MISMATCH";
};

const getSourceData = (
    rawData: unknown,
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
    },
) => {
    const data = getSourceData(
        source.rawData,
    );

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

    /**
     * UPCitemdb response.
     */
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

    /**
     * Open Food Facts response.
     */
    if (
        source.provider ===
        "OpenFoodFacts"
    ) {
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

    /**
     * Unknown provider.
     */
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

const isMatch = (
    check: VerificationCheck,
): boolean => {
    return check === "MATCH";
};

const hasEvidence = (
    check: VerificationCheck,
): boolean => {
    return check !== "UNKNOWN";
};

export const verifyProduct = async (
    productId: number,
    repository: VerificationProductRepository = {
        findProductById:
            findProductById as VerificationProductRepository["findProductById"],
    },
): Promise<VerificationResult> => {
    const product =
        await repository.findProductById(
            productId,
        );

    if (!product) {
        throw new Error(
            "PRODUCT_NOT_FOUND",
        );
    }

    const sources = product.sources;

    const sourceResponse =
        sources.map(
            (source) => ({
                provider:
                    source.provider,

                sourceUrl:
                    source.sourceUrl,

                isPrimary:
                    source.isPrimary,
            }),
        );

    /**
     * No sources means there is no external
     * evidence available.
     */
    if (sources.length === 0) {
        return {
            status:
                "UNABLE_TO_VERIFY",

            verified: false,

            sourceCount: 0,

            sources: [],

            checks: {
                barcodeMatch: "UNKNOWN",
                nameAgreement: "UNKNOWN",
                brandAgreement: "UNKNOWN",
                categoryAgreement: "UNKNOWN",
                manufacturerAgreement: "UNKNOWN",
                countryAgreement: "UNKNOWN",
                modelNumberAgreement: "UNKNOWN",
            },

            message:
                "Unable to verify this product because no product sources are available.",
        };
    }

    /**
     * One source gives us product evidence,
     * but cannot provide cross-source verification.
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
                barcodeMatch: "UNKNOWN",
                nameAgreement: "UNKNOWN",
                brandAgreement: "UNKNOWN",
                categoryAgreement: "UNKNOWN",
                manufacturerAgreement: "UNKNOWN",
                countryAgreement: "UNKNOWN",
                modelNumberAgreement: "UNKNOWN",
            },

            message:
                "Only one product source is available, so there is not enough independent evidence for full verification.",
        };
    }

    /**
     * Extract comparable information from
     * every independent source.
     */
    const extractedSources =
        sources.map(
            (source) =>
                extractSourceFields(
                    source,
                ),
        );

    /**
     * Barcode comparison between sources.
     */
    const barcodeSourceAgreement =
        compareValues(
            extractedSources.map(
                (source) =>
                    source.barcode,
            ),
        );

    const productBarcode =
        normalize(product.barcode);

    const availableBarcodes =
        extractedSources
            .map(
                (source) =>
                    normalize(
                        source.barcode,
                    ),
            )
            .filter(
                (
                    value,
                ): value is string =>
                    value !== null,
            );

    let barcodeMatch:
        VerificationCheck;

    if (
        barcodeSourceAgreement ===
        "MISMATCH"
    ) {
        barcodeMatch = "MISMATCH";
    } else if (
        barcodeSourceAgreement ===
            "MATCH" &&
        productBarcode !== null &&
        availableBarcodes.every(
            (barcode) =>
                barcode ===
                productBarcode,
        )
    ) {
        barcodeMatch = "MATCH";
    } else if (
        barcodeSourceAgreement ===
        "MATCH"
    ) {
        barcodeMatch = "MATCH";
    } else {
        barcodeMatch = "UNKNOWN";
    }

    /**
     * Compare product identity fields.
     */
    const nameAgreement =
        compareValues(
            extractedSources.map(
                (source) =>
                    source.name,
            ),
        );

    const brandAgreement =
        compareValues(
            extractedSources.map(
                (source) =>
                    source.brand,
            ),
        );

    const categoryAgreement =
        compareValues(
            extractedSources.map(
                (source) =>
                    source.category,
            ),
        );

    const manufacturerAgreement =
        compareValues(
            extractedSources.map(
                (source) =>
                    source.manufacturer,
            ),
        );

    const countryAgreement =
        compareValues(
            extractedSources.map(
                (source) =>
                    source.country,
            ),
        );

    const modelNumberAgreement =
        compareValues(
            extractedSources.map(
                (source) =>
                    source.modelNumber,
            ),
        );

    const checks = {
        barcodeMatch,
        nameAgreement,
        brandAgreement,
        categoryAgreement,
        manufacturerAgreement,
        countryAgreement,
        modelNumberAgreement,
    };

    /**
     * Strong identity evidence.
     *
     * Barcode + at least two of:
     * - name
     * - brand
     * - category
     */
    const identityChecks = [
        nameAgreement,
        brandAgreement,
        categoryAgreement,
    ];

    const passedIdentityChecks =
        identityChecks.filter(
            isMatch,
        ).length;

    /**
     * Additional supporting evidence.
     */
    const supportingChecks = [
        manufacturerAgreement,
        countryAgreement,
        modelNumberAgreement,
    ];

    const passedSupportingChecks =
        supportingChecks.filter(
            isMatch,
        ).length;

    /**
     * VERIFIED
     */
    if (
        barcodeMatch === "MATCH" &&
        passedIdentityChecks >= 2
    ) {
        return {
            status: "VERIFIED",

            verified: true,

            sourceCount:
                sources.length,

            sources:
                sourceResponse,

            checks,

            message:
                "Product information is supported by multiple sources that agree on the product identity.",
        };
    }

    /**
     * PARTIALLY VERIFIED
     */
    if (
        passedIdentityChecks > 0 ||
        passedSupportingChecks > 0 ||
        Object.values(checks).some(
            hasEvidence,
        )
    ) {
        return {
            status:
                "PARTIALLY_VERIFIED",

            verified: false,

            sourceCount:
                sources.length,

            sources:
                sourceResponse,

            checks,

            message:
                "Some product information is supported by available sources, but there is not enough consistent evidence for full verification.",
        };
    }

    /**
     * UNABLE TO VERIFY
     */
    return {
        status:
            "UNABLE_TO_VERIFY",

        verified: false,

        sourceCount:
            sources.length,

        sources:
            sourceResponse,

        checks,

        message:
            "Available product sources do not provide enough information to verify this product.",
    };
};
import { apiRequest } from "./client";

export type VerificationCheck =
    | "MATCH"
    | "MISMATCH"
    | "UNKNOWN";

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

type VerificationApiResponse = {
    data: {
        productId: number;
        verification: VerificationResult;
    };
};

export const verifyProduct = async (
    productId: number,
): Promise<VerificationResult> => {
    const response =
        await apiRequest<VerificationApiResponse>(
            `/products/${productId}/verification`,
        );

    return response.data.verification;
};
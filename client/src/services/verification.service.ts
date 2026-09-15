import { api } from "../lib/api";

export type VerificationStatus =
  | "VERIFIED"
  | "PARTIALLY_VERIFIED"
  | "UNABLE_TO_VERIFY";

export interface Verification {
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
}

interface VerificationResponse {
  data: {
    productId: number;
    verification: Verification;
  };
}

export const getProductVerification = async (
  productId: number,
): Promise<Verification> => {
  const response = await api<VerificationResponse>(
    `/products/${productId}/verification`,
  );

  return response.data.verification;
};
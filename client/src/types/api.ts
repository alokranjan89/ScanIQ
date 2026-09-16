export type VerificationCheck =
    | "MATCH"
    | "MISMATCH"
    | "UNKNOWN";

export type VerificationStatus =
    | "VERIFIED"
    | "PARTIALLY_VERIFIED"
    | "UNABLE_TO_VERIFY";

export type ProductIngredient = {
    id: number;
    name: string;
    description?: string | null;
};

export type ProductAttribute = {
    id: number;
    key: string;
    value: string;
};

export type ProductPrice = {
    id: number;
    amount: number | string;
    priceType: string;
    currency: string;
    merchant?: string | null;
    source?: string | null;
    availability?: string | null;
};

export type ProductNutrition = {
    id: number;

    servingSize?: string | null;

    /*
     * These fields intentionally use
     * number | null rather than
     * number | null | undefined.
     *
     * ProductDetailsPage passes them directly
     * to NutritionCard.
     */
    calories: number | null;
    energyKcal: number | null;

    proteinG: number | null;
    carbohydratesG: number | null;
    sugarsG: number | null;
    fatG: number | null;
    saturatedFatG: number | null;
    fiberG: number | null;
    saltG: number | null;
    sodiumMg: number | null;

    nutriScore?: string | null;
};

export type ProductSource = {
    id: number;
    provider: string;
    sourceUrl?: string | null;
    isPrimary: boolean;
    rawData?: unknown;
    createdAt?: string;
    updatedAt?: string;
};

export type Product = {
    id: number;
    barcode: string;
    modelNumber?: string | null;

    name: string;
    brand?: string | null;
    category?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    manufacturer?: string | null;
    country?: string | null;

    createdAt?: string;
    updatedAt?: string;

    ingredients: ProductIngredient[];
    attributes: ProductAttribute[];
    nutrition?: ProductNutrition | null;
    prices: ProductPrice[];
    sources: ProductSource[];
};

export type ProductSearchItem = {
    id: number;
    barcode: string;
    modelNumber?: string | null;

    name: string;
    brand?: string | null;
    category?: string | null;
    imageUrl?: string | null;
};

export type ProductSearchResponse = {
    products: ProductSearchItem[];
    total?: number;
};

export type VerificationSource = {
    provider: string;
    sourceUrl?: string | null;
};

export type VerificationChecks = {
    barcode: VerificationCheck;
    name: VerificationCheck;
    brand: VerificationCheck;
    manufacturer: VerificationCheck;
    country: VerificationCheck;
};

export type VerificationResult = {
    status: VerificationStatus;
    message: string;
    checks: VerificationChecks;
    sources: VerificationSource[];
};

export type User = {
    id: number;
    email: string;
    name?: string | null;
};

/*
 * Backend authentication response:
 *
 * {
 *   data: {
 *     user: {...},
 *     accessToken: "..."
 *   }
 * }
 */
export type AuthResponse = {
    accessToken: string;
    user: User;
};

/*
 * /auth/me response after apiRequest()
 * returns the data payload:
 *
 * {
 *   user: {...}
 * }
 */
export type MeResponse = {
    user: User;
};

export type Favorite = {
    id: number;
    userId: number;
    productId: number;
    createdAt: string;
    product?: Product;
};

export type FavoriteListResponse = {
    data: Favorite[];
};

export type ScanHistoryItem = {
    id: number;
    userId: number;
    productId: number;
    scannedCode: string;
    createdAt: string;
    product?: Product;
};

export type ScanHistoryResponse = {
    data: ScanHistoryItem[];
};

export type ApiSuccessResponse<T> = {
    data: T;
};

export type ApiError = {
    success?: boolean;
    error?: {
        code?: string;
        message?: string;
        details?: unknown;
    };
};
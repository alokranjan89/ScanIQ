/*
 * ============================================================
 * User / Authentication
 * ============================================================
 */

export type User = {
    id: number;
    email: string;
    name: string | null;
    createdAt?: string;
    updatedAt?: string;
};

export type AuthResponse = {
    user: User;
    accessToken: string;
};

export type MeResponse = {
    user: User;
};


/*
 * ============================================================
 * Nutrition
 * ============================================================
 */

export type NutritionUnit =
    | "per_100g"
    | "per_100ml";

export type NutritionWarningCode =
    | "HIGH_SUGAR"
    | "HIGH_SATURATED_FAT"
    | "HIGH_SODIUM"
    | "LOW_FIBER"
    | "HIGH_CALORIES";

export type NutritionWarningSeverity =
    | "info"
    | "warning"
    | "high";

export type NutritionWarning = {
    code: NutritionWarningCode;
    title: string;
    message: string;
    severity: NutritionWarningSeverity;
};

export type NutritionGrade =
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | null;

export type ProductNutritionGrade = {
    grade: NutritionGrade;
    score: number | null;
    calculated: boolean;

    unit: NutritionUnit;

    dataCompleteness: {
        available: number;
        required: number;
        percentage: number;
    };

    warnings: NutritionWarning[];

    explanation: string;
};

export type ProductNutrition = {
    calories?: number | null;
    protein?: number | null;
    carbohydrates?: number | null;
    fat?: number | null;
    saturatedFat?: number | null;
    sugars?: number | null;
    fiber?: number | null;
    salt?: number | null;
    sodium?: number | null;

    unit?: NutritionUnit;

    source?: string | null;
};


/*
 * ============================================================
 * Product
 * ============================================================
 */

export type ProductAttribute = {
    key: string;
    value: string;
};

export type ProductIngredient = {
    name: string;
    description?: string | null;
};

export type ProductPrice = {
    amount: number | string;
    currency: string;
    priceType: string;
    merchant?: string | null;
    source?: string | null;
    availability?: string | null;
};

export type ProductSource = {
    provider: string;
    sourceUrl?: string | null;
    isPrimary?: boolean;
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

    ingredients?: ProductIngredient[];

    attributes?: ProductAttribute[];

    prices?: ProductPrice[];

    nutrition?: ProductNutrition | null;

    nutritionGrade?: ProductNutritionGrade | null;

    sources?: ProductSource[];
};


/*
 * ============================================================
 * Product Search
 * ============================================================
 */

export type ProductSearchItem = {
    id: number;

    barcode: string;

    name: string;

    brand?: string | null;

    category?: string | null;

    imageUrl?: string | null;

    modelNumber?: string | null;
};


/*
 * ============================================================
 * Favorites
 * ============================================================
 */

export type Favorite = {
    id: number;

    userId: number;

    productId: number;

    createdAt?: string;

    product?: Product;
};


/*
 * ============================================================
 * Scan History
 * ============================================================
 */

export type ScanHistoryItem = {
    id: number;

    userId: number;

    productId: number;

    scannedCode: string;

    createdAt: string;

    product?: Product;
};


/*
 * ============================================================
 * Verification
 * ============================================================
 */

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
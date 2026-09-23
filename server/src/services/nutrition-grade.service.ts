/*
 * ---------------------------------------------------------
 * SCANIQ NUTRITION GRADE SERVICE
 * ---------------------------------------------------------
 *
 * This is ScanIQ's own nutrition assessment.
 *
 * IMPORTANT:
 * This is NOT the official Nutri-Score algorithm.
 *
 * The engine:
 *
 * 1. Uses normalized nutrition data.
 * 2. Supports per 100g and per 100ml.
 * 3. Checks data completeness.
 * 4. Calculates a deterministic A-E grade.
 * 5. Generates transparent warnings.
 *
 * Missing data is never treated as a bad nutrition value.
 * If there is not enough data, the grade is not calculated.
 */


/*
 * ---------------------------------------------------------
 * TYPES
 * ---------------------------------------------------------
 */

export type NutritionGrade =
    | "A"
    | "B"
    | "C"
    | "D"
    | "E";


export type NutritionUnit =
    | "per_100g"
    | "per_100ml";


export type NutritionWarningCode =
    | "HIGH_SUGAR"
    | "HIGH_SATURATED_FAT"
    | "HIGH_SODIUM"
    | "LOW_FIBER"
    | "HIGH_CALORIES";


export interface NutritionWarning {
    code: NutritionWarningCode;

    title: string;

    message: string;

    severity:
        | "info"
        | "warning"
        | "high";
}


export interface NutritionGradeNutrition {
    calories?: number | null;

    protein?: number | null;

    carbohydrates?: number | null;

    fat?: number | null;

    saturatedFat?: number | null;

    sugars?: number | null;

    fiber?: number | null;

    salt?: number | null;

    sodium?: number | null;

    unit?:
        | NutritionUnit
        | null;

    source?: string | null;
}


export interface NutritionGradeResult {
    grade:
        | NutritionGrade
        | null;

    score:
        | number
        | null;

    calculated: boolean;

    unit: NutritionUnit;

    dataCompleteness: {
        available: number;

        required: number;

        percentage: number;
    };

    warnings: NutritionWarning[];

    explanation: string;
}


/*
 * ---------------------------------------------------------
 * REQUIRED FIELDS
 * ---------------------------------------------------------
 *
 * These are the core fields used by the ScanIQ grade.
 *
 * We deliberately require 60% availability.
 *
 * Missing values are NOT treated as zero.
 */

const REQUIRED_FIELDS: Array<
    | "calories"
    | "sugars"
    | "saturatedFat"
    | "sodium"
    | "fiber"
> = [
    "calories",
    "sugars",
    "saturatedFat",
    "sodium",
    "fiber",
];


/*
 * ---------------------------------------------------------
 * HELPERS
 * ---------------------------------------------------------
 */

const isValidNumber = (
    value:
        | number
        | null
        | undefined
): value is number => {

    return (
        typeof value === "number" &&
        Number.isFinite(value)
    );
};


/*
 * ---------------------------------------------------------
 * DATA COMPLETENESS
 * ---------------------------------------------------------
 */

const calculateCompleteness = (
    nutrition: NutritionGradeNutrition
) => {

    const available =
        REQUIRED_FIELDS.filter(
            (field) =>
                isValidNumber(
                    nutrition[field]
                )
        ).length;


    const required =
        REQUIRED_FIELDS.length;


    const percentage =
        Math.round(
            (available / required) *
                100
        );


    return {
        available,

        required,

        percentage,
    };
};


/*
 * ---------------------------------------------------------
 * GRADE CALCULATION
 * ---------------------------------------------------------
 *
 * IMPORTANT:
 *
 * The thresholds are intentionally the same as the
 * previously implemented ScanIQ engine.
 *
 * The only change in this version is support for
 * per_100ml as an input unit.
 *
 * The values are interpreted according to the supplied
 * normalized unit.
 */


/*
 * Negative points
 */

const calculateNegativePoints = (
    nutrition: NutritionGradeNutrition
): number => {

    let points = 0;


    /*
     * Calories
     */

    if (
        isValidNumber(
            nutrition.calories
        )
    ) {

        if (
            nutrition.calories >
            600
        ) {
            points += 4;

        } else if (
            nutrition.calories >
            450
        ) {
            points += 3;

        } else if (
            nutrition.calories >
            300
        ) {
            points += 2;

        } else if (
            nutrition.calories >
            150
        ) {
            points += 1;
        }
    }


    /*
     * Sugars
     */

    if (
        isValidNumber(
            nutrition.sugars
        )
    ) {

        if (
            nutrition.sugars >
            25
        ) {
            points += 4;

        } else if (
            nutrition.sugars >
            18
        ) {
            points += 3;

        } else if (
            nutrition.sugars >
            10
        ) {
            points += 2;

        } else if (
            nutrition.sugars >
            5
        ) {
            points += 1;
        }
    }


    /*
     * Saturated fat
     */

    if (
        isValidNumber(
            nutrition.saturatedFat
        )
    ) {

        if (
            nutrition.saturatedFat >
            8
        ) {
            points += 4;

        } else if (
            nutrition.saturatedFat >
            6
        ) {
            points += 3;

        } else if (
            nutrition.saturatedFat >
            4
        ) {
            points += 2;

        } else if (
            nutrition.saturatedFat >
            2
        ) {
            points += 1;
        }
    }


    /*
     * Sodium
     */

    if (
        isValidNumber(
            nutrition.sodium
        )
    ) {

        if (
            nutrition.sodium >
            800
        ) {
            points += 4;

        } else if (
            nutrition.sodium >
            600
        ) {
            points += 3;

        } else if (
            nutrition.sodium >
            400
        ) {
            points += 2;

        } else if (
            nutrition.sodium >
            200
        ) {
            points += 1;
        }
    }


    return points;
};


/*
 * ---------------------------------------------------------
 * POSITIVE POINTS
 * ---------------------------------------------------------
 */

const calculatePositivePoints = (
    nutrition: NutritionGradeNutrition
): number => {

    let points = 0;


    /*
     * Fiber
     */

    if (
        isValidNumber(
            nutrition.fiber
        )
    ) {

        if (
            nutrition.fiber >= 6
        ) {
            points += 4;

        } else if (
            nutrition.fiber >= 4
        ) {
            points += 3;

        } else if (
            nutrition.fiber >= 2
        ) {
            points += 2;

        } else if (
            nutrition.fiber >= 1
        ) {
            points += 1;
        }
    }


    /*
     * Protein
     */

    if (
        isValidNumber(
            nutrition.protein
        )
    ) {

        if (
            nutrition.protein >= 10
        ) {
            points += 2;

        } else if (
            nutrition.protein >= 5
        ) {
            points += 1;
        }
    }


    return points;
};


/*
 * ---------------------------------------------------------
 * SCORE → GRADE
 * ---------------------------------------------------------
 */

const scoreToGrade = (
    score: number
): NutritionGrade => {

    if (
        score <= 0
    ) {
        return "A";
    }


    if (
        score <= 3
    ) {
        return "B";
    }


    if (
        score <= 6
    ) {
        return "C";
    }


    if (
        score <= 9
    ) {
        return "D";
    }


    return "E";
};


/*
 * ---------------------------------------------------------
 * WARNINGS
 * ---------------------------------------------------------
 */

const calculateWarnings = (
    nutrition: NutritionGradeNutrition
): NutritionWarning[] => {

    const warnings:
        NutritionWarning[] = [];


    /*
     * High sugar
     */

    if (
        isValidNumber(
            nutrition.sugars
        ) &&
        nutrition.sugars > 22.5
    ) {

        warnings.push({
            code:
                "HIGH_SUGAR",

            title:
                "High sugar",

            message:
                "This product contains a high amount of sugar per 100 units of the displayed nutrition basis.",

            severity:
                nutrition.sugars > 30
                    ? "high"
                    : "warning",
        });
    }


    /*
     * High saturated fat
     */

    if (
        isValidNumber(
            nutrition.saturatedFat
        ) &&
        nutrition.saturatedFat > 5
    ) {

        warnings.push({
            code:
                "HIGH_SATURATED_FAT",

            title:
                "High saturated fat",

            message:
                "This product contains a relatively high amount of saturated fat.",

            severity:
                nutrition.saturatedFat > 8
                    ? "high"
                    : "warning",
        });
    }


    /*
     * High sodium
     */

    if (
        isValidNumber(
            nutrition.sodium
        ) &&
        nutrition.sodium > 500
    ) {

        warnings.push({
            code:
                "HIGH_SODIUM",

            title:
                "High sodium",

            message:
                "This product contains a relatively high amount of sodium.",

            severity:
                nutrition.sodium > 800
                    ? "high"
                    : "warning",
        });
    }


    /*
     * Low fiber
     */

    if (
        isValidNumber(
            nutrition.fiber
        ) &&
        nutrition.fiber < 2
    ) {

        warnings.push({
            code:
                "LOW_FIBER",

            title:
                "Low fiber",

            message:
                "This product contains a relatively low amount of fiber.",

            severity:
                "info",
        });
    }


    /*
     * High calories
     */

    if (
        isValidNumber(
            nutrition.calories
        ) &&
        nutrition.calories > 400
    ) {

        warnings.push({
            code:
                "HIGH_CALORIES",

            title:
                "High calories",

            message:
                "This product contains a relatively high amount of energy.",

            severity:
                nutrition.calories > 500
                    ? "high"
                    : "warning",
        });
    }


    return warnings;
};


/*
 * ---------------------------------------------------------
 * EXPLANATION
 * ---------------------------------------------------------
 */

const createExplanation = (
    grade: NutritionGrade,
    score: number,
    unit: NutritionUnit
): string => {

    return (
        `ScanIQ calculated a ${grade} nutrition grade using nutrition values reported ${unit === "per_100g" ? "per 100g" : "per 100ml"}. ` +
        `The calculated score is ${score}. ` +
        `This is a ScanIQ assessment and is not the official Nutri-Score algorithm.`
    );
};


/*
 * ---------------------------------------------------------
 * MAIN FUNCTION
 * ---------------------------------------------------------
 */

export const calculateNutritionGrade = (
    nutrition:
        | NutritionGradeNutrition
        | null
        | undefined
): NutritionGradeResult => {

    /*
     * -----------------------------------------------------
     * NO NUTRITION DATA
     * -----------------------------------------------------
     */

    if (!nutrition) {

        return {
            grade: null,

            score: null,

            calculated: false,

            unit: "per_100g",

            dataCompleteness: {
                available: 0,

                required:
                    REQUIRED_FIELDS.length,

                percentage: 0,
            },

            warnings: [],

            explanation:
                "There is not enough nutrition data to calculate a ScanIQ Nutrition Grade.",
        };
    }


    /*
     * -----------------------------------------------------
     * UNIT
     * -----------------------------------------------------
     *
     * Default to per_100g for backwards compatibility.
     */

    const unit: NutritionUnit =
        nutrition.unit ===
            "per_100ml"
            ? "per_100ml"
            : "per_100g";


    /*
     * -----------------------------------------------------
     * COMPLETENESS
     * -----------------------------------------------------
     */

    const dataCompleteness =
        calculateCompleteness(
            nutrition
        );


    /*
     * -----------------------------------------------------
     * MINIMUM DATA REQUIREMENT
     * -----------------------------------------------------
     *
     * At least 60% of the core nutrition fields must
     * be available.
     */

    const minimumRequired =
        Math.ceil(
            REQUIRED_FIELDS.length *
                0.6
        );


    if (
        dataCompleteness.available <
        minimumRequired
    ) {

        return {
            grade: null,

            score: null,

            calculated: false,

            unit,

            dataCompleteness,

            warnings: [],

            explanation:
                "There is not enough nutrition data to calculate a ScanIQ Nutrition Grade.",
        };
    }


    /*
     * -----------------------------------------------------
     * CALCULATE SCORE
     * -----------------------------------------------------
     */

    const negativePoints =
        calculateNegativePoints(
            nutrition
        );


    const positivePoints =
        calculatePositivePoints(
            nutrition
        );


    /*
     * Raw score
     */

    const rawScore =
        negativePoints -
        positivePoints;


    /*
     * Keep score between 0 and 20.
     */

    const score =
        Math.max(
            0,
            Math.min(
                20,
                rawScore
            )
        );


    /*
     * -----------------------------------------------------
     * GRADE
     * -----------------------------------------------------
     */

    const grade =
        scoreToGrade(
            score
        );


    /*
     * -----------------------------------------------------
     * WARNINGS
     * -----------------------------------------------------
     */

    const warnings =
        calculateWarnings(
            nutrition
        );


    /*
     * -----------------------------------------------------
     * RESULT
     * -----------------------------------------------------
     */

    return {

        grade,

        score,

        calculated: true,

        unit,

        dataCompleteness,

        warnings,

        explanation:
            createExplanation(
                grade,
                score,
                unit
            ),
    };
};
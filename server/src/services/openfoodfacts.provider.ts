import {
    ExternalProduct,
    ProductProvider,
} from "./product-provider.service.js";

import { ProviderError } from "../utils/provider-error.js";
import { parseIngredients } from "./ingredient-parser.js";
import { fetchWithTimeout } from "../utils/fetch-with-timeout.js";

/*
 * ---------------------------------------------------------
 * OPEN FOOD FACTS RESPONSE
 * ---------------------------------------------------------
 */

interface OpenFoodFactsResponse {
    status?: number;

    product?: {
        product_name?: string;
        nutrition_data_per?: string;

        brands?: string;
        categories?: string;
        generic_name?: string;
        image_url?: string;
        manufacturers?: string;
        countries?: string;

        ingredients_text?: string;

        packaging?: string;
        quantity?: string;

        allergens?: string;
        traces?: string;

        nutriscore_grade?: string;
        nova_group?: number;

        stores?: string;

        nutriments?: {
            "energy-kcal_100g"?: number;
            "energy-kcal_value"?: number;

            proteins_100g?: number;
            proteins_value?: number;

            carbohydrates_100g?: number;
            carbohydrates_value?: number;

            fat_100g?: number;
            fat_value?: number;

            "saturated-fat_100g"?: number;
            "saturated-fat_value"?: number;

            sugars_100g?: number;
            sugars_value?: number;

            fiber_100g?: number;
            fiber_value?: number;

            salt_100g?: number;
            salt_value?: number;

            sodium_100g?: number;
            sodium_value?: number;
        };
    };
}

/*
 * ---------------------------------------------------------
 * HELPER
 * ---------------------------------------------------------
 *
 * Accept only valid finite numbers.
 */

const getFiniteNumber = (
    value: unknown
): number | undefined => {
    if (typeof value !== "number") {
        return undefined;
    }

    if (!Number.isFinite(value)) {
        return undefined;
    }

    return value;
};

/*
 * ---------------------------------------------------------
 * NUTRITION NORMALIZATION
 * ---------------------------------------------------------
 *
 * ScanIQ preserves the nutrition basis provided by
 * Open Food Facts:
 *
 * - 100g  -> per_100g
 * - 100ml -> per_100ml
 *
 * We do NOT convert between 100g and 100ml because
 * that would require density information.
 *
 * We prefer Open Food Facts *_100g fields.
 *
 * If a *_100g field is unavailable, we can use the
 * corresponding *_value field because it represents
 * the normalized nutrient value exposed by OFF.
 *
 * We do NOT convert serving values here because a safe
 * conversion requires additional information.
 */

const normalizeNutrition = (
    nutriments:
        NonNullable<
            OpenFoodFactsResponse["product"]
        >["nutriments"] | undefined,
    nutritionDataPer?: string
) => {
    if (!nutriments) {
        return undefined;
    }

    const calories =
        getFiniteNumber(
            nutriments["energy-kcal_100g"]
        ) ??
        getFiniteNumber(
            nutriments["energy-kcal_value"]
        );

    const protein =
        getFiniteNumber(
            nutriments.proteins_100g
        ) ??
        getFiniteNumber(
            nutriments.proteins_value
        );

    const carbohydrates =
        getFiniteNumber(
            nutriments.carbohydrates_100g
        ) ??
        getFiniteNumber(
            nutriments.carbohydrates_value
        );

    const fat =
        getFiniteNumber(
            nutriments.fat_100g
        ) ??
        getFiniteNumber(
            nutriments.fat_value
        );

    const saturatedFat =
        getFiniteNumber(
            nutriments["saturated-fat_100g"]
        ) ??
        getFiniteNumber(
            nutriments["saturated-fat_value"]
        );

    const sugars =
        getFiniteNumber(
            nutriments.sugars_100g
        ) ??
        getFiniteNumber(
            nutriments.sugars_value
        );

    const fiber =
        getFiniteNumber(
            nutriments.fiber_100g
        ) ??
        getFiniteNumber(
            nutriments.fiber_value
        );

    const salt =
        getFiniteNumber(
            nutriments.salt_100g
        ) ??
        getFiniteNumber(
            nutriments.salt_value
        );

    const sodium =
        getFiniteNumber(
            nutriments.sodium_100g
        ) ??
        getFiniteNumber(
            nutriments.sodium_value
        );

    /*
     * Don't create an empty nutrition object.
     */

    const hasNutrition = [
        calories,
        protein,
        carbohydrates,
        fat,
        saturatedFat,
        sugars,
        fiber,
        salt,
        sodium,
    ].some(
        (value) =>
            value !== undefined
    );

    if (!hasNutrition) {
        return undefined;
    }

    /*
     * Determine the nutrition basis.
     *
     * Example:
     *
     * nutrition_data_per = "100ml"
     *          -> per_100ml
     *
     * nutrition_data_per = "100g"
     *          -> per_100g
     *
     * Unknown/missing value
     *          -> per_100g for backwards compatibility
     */

    const normalizedNutritionBasis =
        nutritionDataPer
            ?.trim()
            .toLowerCase();

    const unit =
        normalizedNutritionBasis?.includes(
            "100ml"
        )
            ? "per_100ml"
            : "per_100g";

    return {
        calories,
        protein,
        carbohydrates,
        fat,
        saturatedFat,
        sugars,
        fiber,
        salt,
        sodium,

        unit,

        source: "OpenFoodFacts",
    };
};

/*
 * ---------------------------------------------------------
 * OPEN FOOD FACTS PROVIDER
 * ---------------------------------------------------------
 */

export class OpenFoodFactsProvider
    implements ProductProvider {

    async getProductByBarcode(
        barcode: string
    ): Promise<ExternalProduct | null> {

        const encodedBarcode =
            encodeURIComponent(
                barcode
            );

        /*
         * -------------------------------------------------
         * API URL
         * -------------------------------------------------
         */

        const url =
            `https://world.openfoodfacts.org/api/v2/product/${encodedBarcode}.json`;

        let response: Response;

        /*
         * -------------------------------------------------
         * NETWORK REQUEST
         * -------------------------------------------------
         */

        try {
            response =
                await fetchWithTimeout(
                    url,
                    {
                        headers: {
                            Accept:
                                "application/json",

                            "User-Agent":
                                "ScanIQ/1.0 (product intelligence application)",
                        },
                    },
                    5000
                );
        } catch (error) {

            if (
                error instanceof DOMException &&
                error.name === "AbortError"
            ) {
                throw new ProviderError(
                    "Open Food Facts request timed out",
                    "OpenFoodFacts"
                );
            }

            throw new ProviderError(
                "Open Food Facts network request failed",
                "OpenFoodFacts"
            );
        }

        /*
         * -------------------------------------------------
         * HTTP STATUS
         * -------------------------------------------------
         */

        if (!response.ok) {
            throw new ProviderError(
                `Open Food Facts request failed with status ${response.status}`,
                "OpenFoodFacts"
            );
        }

        /*
         * -------------------------------------------------
         * PARSE JSON
         * -------------------------------------------------
         */

        let data:
            OpenFoodFactsResponse;

        try {
            data =
                (await response.json()) as
                    OpenFoodFactsResponse;
        } catch {
            throw new ProviderError(
                "Open Food Facts returned invalid JSON",
                "OpenFoodFacts"
            );
        }

        /*
         * -------------------------------------------------
         * PRODUCT NOT FOUND
         * -------------------------------------------------
         */

        if (
            data.status !== 1 ||
            !data.product
        ) {
            return null;
        }

        const product =
            data.product;

        /*
         * -------------------------------------------------
         * ATTRIBUTES
         * -------------------------------------------------
         */

        const attributes:
            Record<string, string> = {};

        if (product.packaging) {
            attributes.packaging =
                product.packaging.trim();
        }

        if (product.quantity) {
            attributes.package_size =
                product.quantity.trim();
        }

        if (product.generic_name) {
            attributes.generic_name =
                product.generic_name.trim();
        }

        if (product.allergens) {
            attributes.allergens =
                product.allergens.trim();
        }

        if (product.traces) {
            attributes.traces =
                product.traces.trim();
        }

        /*
         * -------------------------------------------------
         * OPEN FOOD FACTS NUTRI-SCORE
         * -------------------------------------------------
         *
         * This is provider data.
         * It is NOT the ScanIQ Nutrition Grade.
         */

        if (product.nutriscore_grade) {

            const nutriScore =
                product.nutriscore_grade
                    .trim()
                    .toUpperCase();

            if (nutriScore) {
                attributes.nutri_score =
                    nutriScore;
            }
        }

        /*
         * -------------------------------------------------
         * NOVA GROUP
         * -------------------------------------------------
         */

        if (
            typeof product.nova_group ===
                "number" &&
            Number.isFinite(
                product.nova_group
            )
        ) {
            attributes.nova_group =
                String(
                    product.nova_group
                );
        }

        if (product.stores) {
            attributes.stores =
                product.stores.trim();
        }

        /*
         * -------------------------------------------------
         * INGREDIENTS
         * -------------------------------------------------
         */

        const ingredientsText =
            product.ingredients_text
                ?.trim();

        const ingredients =
            parseIngredients(
                ingredientsText
            );

        /*
         * -------------------------------------------------
         * NUTRITION
         * -------------------------------------------------
         *
         * Pass nutrition_data_per so ScanIQ can preserve
         * whether the values are per 100g or per 100ml.
         */

        const nutrition =
            normalizeNutrition(
                product.nutriments,
                product.nutrition_data_per
            );

        /*
         * -------------------------------------------------
         * SOURCE URL
         * -------------------------------------------------
         */

        const sourceUrl =
            `https://world.openfoodfacts.org/product/${encodedBarcode}`;

        /*
         * -------------------------------------------------
         * NORMALIZED PRODUCT
         * -------------------------------------------------
         */

        return {
            barcode,

            name:
                product.product_name
                    ?.trim() ||
                "Unknown Product",

            brand:
                product.brands
                    ?.trim(),

            category:
                product.categories
                    ?.trim(),

            description:
                product.generic_name
                    ?.trim(),

            imageUrl:
                product.image_url
                    ?.trim(),

            manufacturer:
                product.manufacturers
                    ?.trim(),

            country:
                product.countries
                    ?.trim(),

            ingredients,

            attributes:
                Object.keys(
                    attributes
                ).length > 0
                    ? attributes
                    : undefined,

            nutrition,

            source:
                "OpenFoodFacts",

            sourceUrl,

            /*
             * Preserve the complete provider
             * response for provenance/debugging.
             */

            sources: [
                {
                    provider:
                        "OpenFoodFacts",

                    sourceUrl,

                    rawData:
                        JSON.parse(
                            JSON.stringify(
                                data
                            )
                        ),

                    isPrimary:
                        true,
                },
            ],
        };
    }
}
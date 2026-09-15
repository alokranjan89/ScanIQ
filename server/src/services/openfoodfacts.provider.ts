import {
    ExternalProduct,
    ProductProvider,
} from "./product-provider.service.js";

import { ProviderError } from "../utils/provider-error.js";
import { parseIngredients } from "./ingredient-parser.js";
import { fetchWithTimeout } from "../utils/fetch-with-timeout.js";

interface OpenFoodFactsResponse {
    status?: number;

    product?: {
        product_name?: string;
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
            proteins_100g?: number;
            carbohydrates_100g?: number;
            fat_100g?: number;
            "saturated-fat_100g"?: number;
            sugars_100g?: number;
            fiber_100g?: number;
            salt_100g?: number;
            sodium_100g?: number;
        };
    };
}

export class OpenFoodFactsProvider implements ProductProvider {
    async getProductByBarcode(
        barcode: string
    ): Promise<ExternalProduct | null> {
        const encodedBarcode = encodeURIComponent(barcode);

        const url =
            `https://world.openfoodfacts.org/api/v2/product/${encodedBarcode}.json`;

        let response: Response;

        try {
            response = await fetchWithTimeout(
                url,
                {
                    headers: {
                        Accept: "application/json",
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

        if (!response.ok) {
            throw new ProviderError(
                `Open Food Facts request failed with status ${response.status}`,
                "OpenFoodFacts"
            );
        }

        let data: OpenFoodFactsResponse;

        try {
            data =
                (await response.json()) as OpenFoodFactsResponse;
        } catch {
            throw new ProviderError(
                "Open Food Facts returned invalid JSON",
                "OpenFoodFacts"
            );
        }

        if (
            data.status !== 1 ||
            !data.product
        ) {
            return null;
        }

        const product = data.product;

        const attributes: Record<string, string> = {};

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

        if (product.nutriscore_grade) {
            attributes.nutri_score =
                product.nutriscore_grade
                    .trim()
                    .toUpperCase();
        }

        if (
            typeof product.nova_group === "number" &&
            Number.isFinite(product.nova_group)
        ) {
            attributes.nova_group =
                String(product.nova_group);
        }

        if (product.stores) {
            attributes.stores =
                product.stores.trim();
        }

        const ingredientsText =
            product.ingredients_text?.trim();

        const ingredients =
            parseIngredients(ingredientsText);

        const nutriments =
            product.nutriments;

        const hasNutrition =
            nutriments &&
            Object.values(nutriments).some(
                (value) =>
                    typeof value === "number" &&
                    Number.isFinite(value)
            );

        const nutrition = hasNutrition
            ? {
                  calories:
                      nutriments[
                          "energy-kcal_100g"
                      ],

                  protein:
                      nutriments.proteins_100g,

                  carbohydrates:
                      nutriments.carbohydrates_100g,

                  fat:
                      nutriments.fat_100g,

                  saturatedFat:
                      nutriments[
                          "saturated-fat_100g"
                      ],

                  sugars:
                      nutriments.sugars_100g,

                  fiber:
                      nutriments.fiber_100g,

                  salt:
                      nutriments.salt_100g,

                  sodium:
                      nutriments.sodium_100g,

                  unit: "per_100g",

                  source: "OpenFoodFacts",
              }
            : undefined;

        const sourceUrl =
            `https://world.openfoodfacts.org/product/${encodedBarcode}`;

        return {
            barcode,

            name:
                product.product_name?.trim() ||
                "Unknown Product",

            brand:
                product.brands?.trim(),

            category:
                product.categories?.trim(),

            description:
                product.generic_name?.trim(),

            imageUrl:
                product.image_url?.trim(),

            manufacturer:
                product.manufacturers?.trim(),

            country:
                product.countries?.trim(),

            ingredients,

            attributes:
                Object.keys(attributes).length > 0
                    ? attributes
                    : undefined,

            nutrition,

            source:
                "OpenFoodFacts",

            sourceUrl,

            sources: [
                {
                    provider:
                        "OpenFoodFacts",

                    sourceUrl,

                    rawData:
                        JSON.parse(
                            JSON.stringify(data)
                        ),

                    isPrimary: true,
                },
            ],
        };
    }
}
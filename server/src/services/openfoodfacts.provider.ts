import {
    ExternalProduct,
    ProductProvider,
} from "./product-provider.service.js";

import { ProviderError } from "../utils/provider-error.js";

interface OpenFoodFactsResponse {
    status?: number;
    status_verbose?: string;
    code?: string;

    product?: {
        product_name?: string;
        product_name_en?: string;

        brands?: string;

        categories?: string;
        categories_tags?: string[];

        generic_name?: string;
        generic_name_en?: string;

        image_url?: string;
        image_front_url?: string;

        quantity?: string;

        countries?: string;
        countries_tags?: string[];

        ingredients_text?: string;
        ingredients_text_en?: string;

        allergens?: string;
        allergens_tags?: string[];

        traces?: string;
        traces_tags?: string[];

        nutriments?: Record<string, unknown>;

        nutrition_grades?: string;
        nova_group?: number;

        stores?: string;
    };
}

export class OpenFoodFactsProvider implements ProductProvider {
    async getProductByBarcode(
        barcode: string
    ): Promise<ExternalProduct | null> {
        const url =
            `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;

        let response: Response;

        try {
            response = await fetch(url, {
                headers: {
                    "User-Agent":
                        "ScanIQ/1.0 (product intelligence application)",
                },
            });
        } catch (error) {
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

        const data =
            (await response.json()) as OpenFoodFactsResponse;

        if (data.status !== 1 || !data.product) {
            return null;
        }

        const product = data.product;

        const attributes: Record<string, string> = {};

        if (product.quantity) {
            attributes.package_size = product.quantity;
        }

        if (product.generic_name_en) {
            attributes.generic_name = product.generic_name_en;
        } else if (product.generic_name) {
            attributes.generic_name = product.generic_name;
        }

        if (product.allergens) {
            attributes.allergens = product.allergens;
        }

        if (product.traces) {
            attributes.traces = product.traces;
        }

        if (product.nutrition_grades) {
            attributes.nutri_score =
                product.nutrition_grades.toUpperCase();
        }

        if (product.nova_group !== undefined) {
            attributes.nova_group =
                String(product.nova_group);
        }

        if (product.stores) {
            attributes.stores = product.stores;
        }

        const ingredientsText =
            product.ingredients_text_en ??
            product.ingredients_text;

        const ingredients = ingredientsText
            ? ingredientsText
                  .split(",")
                  .map((ingredient) => ingredient.trim())
                  .filter(Boolean)
                  .map((ingredient) => ({
                      name: ingredient,
                  }))
            : undefined;

        const nutriments = product.nutriments;

        const nutrition = nutriments
            ? {
                  calories:
                      typeof nutriments["energy-kcal_100g"] ===
                      "number"
                          ? nutriments["energy-kcal_100g"]
                          : undefined,

                  protein:
                      typeof nutriments["proteins_100g"] ===
                      "number"
                          ? nutriments["proteins_100g"]
                          : undefined,

                  carbohydrates:
                      typeof nutriments["carbohydrates_100g"] ===
                      "number"
                          ? nutriments["carbohydrates_100g"]
                          : undefined,

                  fat:
                      typeof nutriments["fat_100g"] ===
                      "number"
                          ? nutriments["fat_100g"]
                          : undefined,

                  saturatedFat:
                      typeof nutriments["saturated-fat_100g"] ===
                      "number"
                          ? nutriments["saturated-fat_100g"]
                          : undefined,

                  sugars:
                      typeof nutriments["sugars_100g"] ===
                      "number"
                          ? nutriments["sugars_100g"]
                          : undefined,

                  fiber:
                      typeof nutriments["fiber_100g"] ===
                      "number"
                          ? nutriments["fiber_100g"]
                          : undefined,

                  salt:
                      typeof nutriments["salt_100g"] ===
                      "number"
                          ? nutriments["salt_100g"]
                          : undefined,

                  sodium:
                      typeof nutriments["sodium_100g"] ===
                      "number"
                          ? nutriments["sodium_100g"]
                          : undefined,

                  unit: "per_100g",
                  source: "OpenFoodFacts",
              }
            : undefined;

        return {
            barcode,

            name:
                product.product_name_en ??
                product.product_name ??
                "Unknown Food Product",

            brand: product.brands,

            category:
                product.categories_tags?.[0] ??
                product.categories,

            description:
                product.generic_name_en ??
                product.generic_name,

            imageUrl:
                product.image_front_url ??
                product.image_url,

            country:
                product.countries_tags?.[0] ??
                product.countries,

            ingredients,

            nutrition:
                nutrition &&
                Object.values(nutrition).some(
                    (value) =>
                        typeof value === "number" &&
                        Number.isFinite(value)
                )
                    ? nutrition
                    : undefined,

            attributes:
                Object.keys(attributes).length > 0
                    ? attributes
                    : undefined,
        };
    }
}
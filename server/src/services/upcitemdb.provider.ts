import {
    ExternalProduct,
    ProductProvider,
} from "./product-provider.service.js";

import { ProviderError } from "../utils/provider-error.js";
import { fetchWithTimeout } from "../utils/fetch-with-timeout.js";

interface UPCItemDBOffer {
    merchant?: string;
    domain?: string;
    currency?: string;
    availability?: string;
    price?: number;
    list_price?: number;
}

interface UPCItemDBItem {
    ean?: string;
    upc?: string;
    title?: string;
    description?: string;
    brand?: string;
    category?: string;
    model?: string;
    color?: string;
    size?: string;
    dimension?: string;
    weight?: string;
    manufacturer?: string;
    country?: string;
    images?: string[];
    offers?: UPCItemDBOffer[];
}

interface UPCItemDBResponse {
    code?: string;
    total?: number;
    offset?: number;
    items?: UPCItemDBItem[];
}

export class UPCItemDBProvider implements ProductProvider {
    async getProductByBarcode(
        barcode: string
    ): Promise<ExternalProduct | null> {
        const encodedBarcode =
            encodeURIComponent(barcode);

        const url =
            `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodedBarcode}`;

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
                    "UPCitemdb request timed out",
                    "UPCitemdb"
                );
            }

            throw new ProviderError(
                "UPCitemdb network request failed",
                "UPCitemdb"
            );
        }

        if (!response.ok) {
            throw new ProviderError(
                `UPCitemdb request failed with status ${response.status}`,
                "UPCitemdb"
            );
        }

        let data: UPCItemDBResponse;

        try {
            data =
                (await response.json()) as UPCItemDBResponse;
        } catch {
            throw new ProviderError(
                "UPCitemdb returned invalid JSON",
                "UPCitemdb"
            );
        }

        const item = data.items?.[0];

        if (!item) {
            return null;
        }

        const attributes: Record<string, string> = {};

        if (item.model) {
            attributes.model =
                item.model.trim();
        }

        if (item.color) {
            attributes.color =
                item.color.trim();
        }

        if (item.size) {
            attributes.size =
                item.size.trim();
        }

        if (item.dimension) {
            attributes.dimension =
                item.dimension.trim();
        }

        if (item.weight) {
            attributes.weight =
                item.weight.trim();
        }

        const prices = (item.offers ?? []).flatMap(
            (offer) => {
                const result: Array<{
                    amount: number;
                    priceType: string;
                    currency: string;
                    merchant?: string;
                    source?: string;
                    availability?: string;
                }> = [];

                if (
                    typeof offer.price === "number" &&
                    Number.isFinite(offer.price) &&
                    offer.price >= 0
                ) {
                    result.push({
                        amount: offer.price,
                        priceType: "SALE",
                        currency:
                            offer.currency || "USD",
                        merchant:
                            offer.merchant,
                        source:
                            "UPCitemdb",
                        availability:
                            offer.availability,
                    });
                }

                if (
                    typeof offer.list_price === "number" &&
                    Number.isFinite(
                        offer.list_price
                    ) &&
                    offer.list_price >= 0
                ) {
                    result.push({
                        amount:
                            offer.list_price,
                        priceType: "LIST",
                        currency:
                            offer.currency || "USD",
                        merchant:
                            offer.merchant,
                        source:
                            "UPCitemdb",
                        availability:
                            offer.availability,
                    });
                }

                return result;
            }
        );

        const sourceUrl =
            `https://www.upcitemdb.com/upc/${encodedBarcode}`;

        return {
            barcode,

            name:
                item.title?.trim() ||
                "Unknown Product",

            brand:
                item.brand?.trim(),

            category:
                item.category?.trim(),

            description:
                item.description?.trim(),

            imageUrl:
                item.images?.[0]?.trim(),

            manufacturer:
                item.manufacturer?.trim(),

            country:
                item.country?.trim(),

            attributes:
                Object.keys(attributes).length > 0
                    ? attributes
                    : undefined,

            prices:
                prices.length > 0
                    ? prices
                    : undefined,

            source:
                "UPCitemdb",

            sourceUrl,

            sources: [
                {
                    provider:
                        "UPCitemdb",

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
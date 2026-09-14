import {
    ExternalProduct,
    ProductProvider,
} from "./product-provider.service.js";
import { ProviderError } from "../utils/provider-error.js";

interface UPCItemDBOffer {
    merchant?: string;
    domain?: string;
    currency?: string;
    list_price?: number | string;
    price?: number;
    availability?: string;
    condition?: string;
    link?: string;
    updated_t?: number;
}

interface UPCItemDBItem {
    ean?: string;
    upc?: string;
    gtin?: string;

    title?: string;
    description?: string;
    brand?: string;
    model?: string;
    color?: string;
    size?: string;
    dimension?: string;
    weight?: string;
    category?: string;

    images?: string[];

    offers?: UPCItemDBOffer[];
}

interface UPCItemDBResponse {
    code?: string;
    total?: number;
    items?: UPCItemDBItem[];
}

export class UPCItemDBProvider implements ProductProvider {
    async getProductByBarcode(
        barcode: string
    ): Promise<ExternalProduct | null> {
        let response: Response;

        try {
            response = await fetch(
                `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
            );
        } catch (error) {
            throw new ProviderError(
                "UPCitemdb network request failed",
                "UPCitemdb"
            );
        }

        if (!response.ok) {
            throw new ProviderError(
                `UPCItemDB request failed with status ${response.status}`,
                "UPCitemdb"
            );
        }

        const data =
            (await response.json()) as UPCItemDBResponse;

        const item = data.items?.[0];

        if (!item) {
            return null;
        }

        const attributes: Record<string, string> = {};

        if (item.model) {
            attributes.model = item.model;
        }

        if (item.color) {
            attributes.color = item.color;
        }

        if (item.size) {
            attributes.size = item.size;
        }

        if (item.dimension) {
            attributes.dimension = item.dimension;
        }

        if (item.weight) {
            attributes.weight = item.weight;
        }

        const prices = (item.offers ?? [])
            .flatMap((offer) => {
                const result = [];

                if (typeof offer.price === "number" && offer.price >= 0) {
                    result.push({
                        amount: offer.price,
                        priceType: "SALE",
                        currency: offer.currency || "USD",
                        merchant: offer.merchant,
                        source: "UPCitemdb",
                        availability: offer.availability,
                    });
                }

                if (
                    typeof offer.list_price === "number" &&
                    offer.list_price >= 0
                ) {
                    result.push({
                        amount: offer.list_price,
                        priceType: "LIST",
                        currency: offer.currency || "USD",
                        merchant: offer.merchant,
                        source: "UPCitemdb",
                        availability: offer.availability,
                    });
                }

                return result;
            });

        return {
            barcode,
            name: item.title ?? "Unknown Product",
            brand: item.brand,
            category: item.category,
            description: item.description,
            imageUrl: item.images?.[0],
            attributes:
                Object.keys(attributes).length > 0
                    ? attributes
                    : undefined,
            prices: prices.length > 0 ? prices : undefined,
        };
    }
}
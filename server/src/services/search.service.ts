import {
  searchProducts,
} from "../repositories/search.repository.js";
import { getProductByBarcode } from "./product.service.js";
import { fetchWithTimeout } from "../utils/fetch-with-timeout.js";

interface ExternalSearchProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  categories?: string;
  image_url?: string;
  image_front_url?: string;
}

interface ExternalSearchResponse {
  products?: ExternalSearchProduct[];
}

type SearchResultItem = Awaited<ReturnType<typeof searchProducts>>[number];

export const searchProductCatalog = async (
  query: string,
  limit: number
) => {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  // 1. Search local PostgreSQL database first
  const localResults: SearchResultItem[] = await searchProducts(
    normalizedQuery,
    limit
  );

  // If we already have enough results, return them
  if (localResults.length >= limit) {
    return localResults;
  }

  const existingBarcodes = new Set(localResults.map((p) => p.barcode));

  // 2. If the query looks like a barcode (8-14 digits), try direct barcode lookup
  const isBarcode = /^\d{8,14}$/.test(normalizedQuery);
  if (isBarcode && !existingBarcodes.has(normalizedQuery)) {
    try {
      const product = (await getProductByBarcode(normalizedQuery)) as SearchResultItem | null;
      if (product && product.id) {
        return [product, ...localResults];
      }
    } catch {
      // Ignore barcode lookup failures, proceed to external search
    }
  }

  // 3. Query Open Food Facts search API for live catalog discovery
  try {
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      normalizedQuery
    )}&search_simple=1&action=process&json=1&page_size=10`;

    const response = await fetchWithTimeout(
      searchUrl,
      {
        headers: {
          "User-Agent": "ScanIQ - Product Intelligence - Version 1.0",
        },
      },
      6000
    );

    if (response.ok) {
      const data = (await response.json()) as ExternalSearchResponse;
      const externalProducts = data.products ?? [];

      const candidates = externalProducts
        .filter(
          (p) =>
            p.code &&
            p.product_name &&
            p.product_name.trim().length > 0 &&
            !existingBarcodes.has(p.code)
        )
        .slice(0, 5);

      if (candidates.length > 0) {
        // Hydrate top candidates via getProductByBarcode so they are persisted and assigned IDs
        const hydrated = await Promise.allSettled(
          candidates.map((candidate) =>
            getProductByBarcode(candidate.code!.trim())
          )
        );

        for (const item of hydrated) {
          if (item.status === "fulfilled" && item.value) {
            const product = item.value as SearchResultItem;
            if (product && product.barcode && !existingBarcodes.has(product.barcode)) {
              existingBarcodes.add(product.barcode);
              localResults.push(product);
            }
          }
        }
      }
    }
  } catch (error) {
    // External catalog failure should be non-blocking
    console.error("External catalog search failure:", error);
  }

  return localResults.slice(0, limit);
};
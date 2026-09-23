import {
  searchProducts,
} from "../repositories/search.repository.js";

import {
  getProductByBarcode,
} from "./product.service.js";

import {
  fetchWithTimeout,
} from "../utils/fetch-with-timeout.js";


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


/*
 * This is the shape returned by PostgreSQL search.
 *
 * getProductByBarcode() may now contain additional fields
 * such as nutritionGrade.
 *
 * We only return the fields required by search results.
 */
type SearchResultItem =
  Awaited<
    ReturnType<typeof searchProducts>
  >[number];


/*
 * Convert a product returned by the product service
 * into the shape expected by the search result.
 *
 * We intentionally do not cast with `as SearchResultItem`
 * because the product service now contains additional
 * application-level fields such as nutritionGrade.
 */
const toSearchResultItem = (
  product: Awaited<
    ReturnType<typeof getProductByBarcode>
  >
): SearchResultItem | null => {

  if (!product) {
    return null;
  }


  /*
   * SearchResultItem is based on the PostgreSQL
   * Product model.
   *
   * The product service result contains the same
   * product fields plus nutritionGrade.
   *
   * We explicitly select the fields required
   * by search results.
   */

  return {
    id: product.id,
    barcode: product.barcode,
    modelNumber: product.modelNumber ?? null,
    name: product.name,
    brand: product.brand ?? null,
    category: product.category ?? null,
    description: product.description ?? null,
    imageUrl: product.imageUrl ?? null,
    manufacturer: product.manufacturer ?? null,
    country: product.country ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};


export const searchProductCatalog = async (
  query: string,
  limit: number
) => {

  /*
   * ------------------------------------------------------
   * NORMALIZE QUERY
   * ------------------------------------------------------
   */

  const normalizedQuery =
    query.trim();


  if (!normalizedQuery) {
    return [];
  }


  /*
   * ------------------------------------------------------
   * 1. SEARCH LOCAL POSTGRESQL DATABASE
   * ------------------------------------------------------
   */

  const localResults:
    SearchResultItem[] =
    await searchProducts(
      normalizedQuery,
      limit
    );


  /*
   * If PostgreSQL already has enough
   * results, don't make external requests.
   */

  if (localResults.length >= limit) {
    return localResults;
  }


  /*
   * Keep track of barcodes that we already
   * have so we don't return duplicates.
   */

  const existingBarcodes =
    new Set(
      localResults.map(
        (product) =>
          product.barcode
      )
    );


  /*
   * ------------------------------------------------------
   * 2. DIRECT BARCODE LOOKUP
   * ------------------------------------------------------
   *
   * If the search query looks like a barcode,
   * try the normal product lookup service.
   *
   * This gives us:
   *
   * Redis
   *   ↓
   * PostgreSQL
   *   ↓
   * External provider
   *
   * without duplicating that logic here.
   */

  const isBarcode =
    /^\d{8,14}$/.test(
      normalizedQuery
    );


  if (
    isBarcode &&
    !existingBarcodes.has(
      normalizedQuery
    )
  ) {

    try {

      const product =
        await getProductByBarcode(
          normalizedQuery
        );


      const searchResult =
        toSearchResultItem(
          product
        );


      if (
        searchResult &&
        searchResult.id
      ) {

        return [
          searchResult,
          ...localResults,
        ];
      }

    } catch {

      /*
       * Barcode lookup failure should not
       * prevent normal external search.
       */

    }
  }


  /*
   * ------------------------------------------------------
   * 3. OPEN FOOD FACTS SEARCH
   * ------------------------------------------------------
   *
   * PostgreSQL did not provide enough results,
   * so use Open Food Facts for catalog discovery.
   */

  try {

    const searchUrl =
      `https://world.openfoodfacts.org/cgi/search.pl?` +
      `search_terms=${encodeURIComponent(
        normalizedQuery
      )}` +
      `&search_simple=1` +
      `&action=process` +
      `&json=1` +
      `&page_size=10`;


    const response =
      await fetchWithTimeout(
        searchUrl,
        {
          headers: {
            "User-Agent":
              "ScanIQ - Product Intelligence - Version 1.0",
          },
        },
        6000
      );


    /*
     * ----------------------------------------------------
     * Only process successful responses.
     * ----------------------------------------------------
     */

    if (response.ok) {

      const data =
        (await response.json()) as
          ExternalSearchResponse;


      const externalProducts =
        data.products ?? [];


      /*
       * --------------------------------------------------
       * Filter usable candidates
       * --------------------------------------------------
       */

      const candidates =
        externalProducts
          .filter(
            (product) =>
              product.code &&
              product.product_name &&
              product.product_name
                .trim()
                .length > 0 &&
              !existingBarcodes.has(
                product.code
              )
          )
          .slice(0, 5);


      /*
       * --------------------------------------------------
       * Hydrate candidates
       * --------------------------------------------------
       *
       * Instead of returning raw Open Food Facts
       * objects, pass each barcode through the normal
       * ScanIQ product service.
       *
       * This means the product will be:
       *
       * Open Food Facts
       *       ↓
       * normalize
       *       ↓
       * PostgreSQL
       *       ↓
       * Redis
       *       ↓
       * Search result
       */

      if (
        candidates.length > 0
      ) {

        const hydrated =
          await Promise.allSettled(
            candidates.map(
              (candidate) =>
                getProductByBarcode(
                  candidate
                    .code!
                    .trim()
                )
            )
          );


        /*
         * ------------------------------------------------
         * Add successfully hydrated products
         * ------------------------------------------------
         */

        for (
          const item
          of hydrated
        ) {

          if (
            item.status !==
            "fulfilled"
          ) {
            continue;
          }


          const searchResult =
            toSearchResultItem(
              item.value
            );


          if (
            !searchResult
          ) {
            continue;
          }


          if (
            !searchResult.barcode
          ) {
            continue;
          }


          if (
            existingBarcodes.has(
              searchResult.barcode
            )
          ) {
            continue;
          }


          /*
           * Prevent duplicate products
           * from being added.
           */

          existingBarcodes.add(
            searchResult.barcode
          );


          localResults.push(
            searchResult
          );


          /*
           * Stop adding results once
           * the requested limit is reached.
           */

          if (
            localResults.length >=
            limit
          ) {
            break;
          }
        }
      }
    }

  } catch (error) {

    /*
     * External catalog failure is
     * intentionally non-blocking.
     *
     * We can still return whatever
     * PostgreSQL already found.
     */

    console.error(
      "External catalog search failure:",
      error
    );
  }


  /*
   * ------------------------------------------------------
   * FINAL RESULT
   * ------------------------------------------------------
   *
   * Never return more than the requested limit.
   */

  return localResults.slice(
    0,
    limit
  );
};
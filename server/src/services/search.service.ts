import {
  searchProducts,
} from "../repositories/search.repository.js";

export const searchProductCatalog = async (
  query: string,
  limit: number
) => {
  const normalizedQuery = query.trim();

  return searchProducts(
    normalizedQuery,
    limit
  );
};
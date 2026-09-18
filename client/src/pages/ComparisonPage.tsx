import { useEffect, useState } from "react";
import {
    Link,
    useSearchParams,
} from "react-router-dom";

import {
    compareProducts,
} from "../api/comparison.api";

import {
    searchProducts,
} from "../api/search.api";

import type {
    Product,
    ProductSearchItem,
} from "../types/api";

function ComparisonPage() {
    const [searchParams] = useSearchParams();

    const productId1 = Number(
        searchParams.get("productId1"),
    );

    const productId2 = Number(
        searchParams.get("productId2"),
    );

    const [products, setProducts] =
        useState<Product[]>([]);

    const [searchResults, setSearchResults] =
        useState<ProductSearchItem[]>([]);

    const [query, setQuery] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(true);

    const [isSearching, setIsSearching] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    /*
     * Load comparison when two product IDs
     * are present in the URL.
     */
    useEffect(() => {
        const loadComparison = async () => {
            if (
                !Number.isInteger(productId1) ||
                productId1 <= 0
            ) {
                setError(
                    "A valid first product is required.",
                );

                setIsLoading(false);

                return;
            }

            /*
             * If productId2 is missing, we don't
             * call the comparison API yet.
             *
             * The user must first select
             * the second product.
             */
            if (
                !Number.isInteger(productId2) ||
                productId2 <= 0
            ) {
                setProducts([]);
                setIsLoading(false);
                setError(null);

                return;
            }

            if (productId1 === productId2) {
                setError(
                    "Please select two different products.",
                );

                setIsLoading(false);

                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const result =
                    await compareProducts(
                        productId1,
                        productId2,
                    );

                setProducts(result);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to compare products.",
                );
            } finally {
                setIsLoading(false);
            }
        };

        void loadComparison();
    }, [productId1, productId2]);

    /*
     * Search for the second product.
     */
    const handleSearch = async () => {
        const trimmedQuery =
            query.trim();

        if (!trimmedQuery) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            setError(null);

            const results =
                await searchProducts(
                    trimmedQuery,
                    10,
                );

            setSearchResults(results);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to search products.",
            );
        } finally {
            setIsSearching(false);
        }
    };

    /*
     * User has not selected the second
     * product yet.
     */
    if (!productId2) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-8">
                <Link
                    to="/"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                    ← Back
                </Link>

                <div className="mt-6">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Compare Products
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Search for another product to
                        compare.
                    </p>
                </div>

                {/* Search */}
                <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <label
                        htmlFor="compare-search"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Find a product
                    </label>

                    <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                        <input
                            id="compare-search"
                            type="text"
                            value={query}
                            onChange={(event) =>
                                setQuery(
                                    event.target.value,
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key ===
                                    "Enter"
                                ) {
                                    void handleSearch();
                                }
                            }}
                            placeholder="Search by product name, brand or barcode"
                            className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                        />

                        <button
                            type="button"
                            onClick={() =>
                                void handleSearch()
                            }
                            disabled={
                                isSearching ||
                                !query.trim()
                            }
                            className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSearching
                                ? "Searching..."
                                : "Search"}
                        </button>
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <h2 className="text-sm font-semibold text-gray-900">
                                Search results
                            </h2>

                            {searchResults.map(
                                (product) => (
                                    <Link
                                        key={product.id}
                                        to={`/compare?productId1=${productId1}&productId2=${product.id}`}
                                        className="block rounded-xl border border-gray-200 p-4 transition hover:border-gray-400 hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={
                                                            product.imageUrl
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-400">
                                                        No image
                                                    </span>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-sm text-gray-500">
                                                    {product.brand ||
                                                        "Unknown brand"}
                                                </p>

                                                <p className="font-medium text-gray-900">
                                                    {
                                                        product.name
                                                    }
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {
                                                        product.barcode
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ),
                            )}
                        </div>
                    )}

                    {!isSearching &&
                        query.trim() &&
                        searchResults.length ===
                            0 && (
                            <p className="mt-6 text-sm text-gray-500">
                                No products found.
                            </p>
                        )}
                </div>
            </main>
        );
    }

    /*
     * Loading comparison.
     */
    if (isLoading) {
        return (
            <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                    <p className="text-sm text-gray-600">
                        Comparing products...
                    </p>
                </div>
            </main>
        );
    }

    /*
     * Comparison error.
     */
    if (error) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-10">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <h1 className="text-lg font-semibold text-red-800">
                        Comparison failed
                    </h1>

                    <p className="mt-2 text-sm text-red-700">
                        {error}
                    </p>

                    <Link
                        to={`/compare?productId1=${productId1}`}
                        className="mt-5 inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
                    >
                        Choose another product
                    </Link>
                </div>
            </main>
        );
    }

    if (products.length !== 2) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-10">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                    <h1 className="text-lg font-semibold text-gray-900">
                        Unable to compare products
                    </h1>

                    <p className="mt-2 text-sm text-gray-600">
                        Two products are required for
                        comparison.
                    </p>
                </div>
            </main>
        );
    }

    const [
        product1,
        product2,
    ] = products;

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    to="/"
                    className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                    ← Back
                </Link>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                    Compare Products
                </h1>

                <p className="mt-2 text-gray-600">
                    Compare the available information for
                    these two products.
                </p>
            </div>

            {/* Products */}
            <div className="grid gap-6 md:grid-cols-2">
                <ProductCard product={product1} />
                <ProductCard product={product2} />
            </div>

            {/* Comparison table */}
            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-6 py-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Product Comparison
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    Attribute
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    {product1.name}
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                                    {product2.name}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            <ComparisonRow
                                label="Brand"
                                value1={product1.brand}
                                value2={product2.brand}
                            />

                            <ComparisonRow
                                label="Category"
                                value1={
                                    product1.category
                                }
                                value2={
                                    product2.category
                                }
                            />

                            <ComparisonRow
                                label="Manufacturer"
                                value1={
                                    product1.manufacturer
                                }
                                value2={
                                    product2.manufacturer
                                }
                            />

                            <ComparisonRow
                                label="Country"
                                value1={
                                    product1.country
                                }
                                value2={
                                    product2.country
                                }
                            />

                            <ComparisonRow
                                label="Barcode"
                                value1={
                                    product1.barcode
                                }
                                value2={
                                    product2.barcode
                                }
                            />

                            <ComparisonRow
                                label="Model Number"
                                value1={
                                    product1.modelNumber
                                }
                                value2={
                                    product2.modelNumber
                                }
                            />

                            <ComparisonRow
                                label="Description"
                                value1={
                                    product1.description
                                }
                                value2={
                                    product2.description
                                }
                            />
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Compare another product */}
            <div className="mt-6 text-center">
                <Link
                    to={`/compare?productId1=${product1.id}`}
                    className="text-sm font-medium text-gray-900 underline"
                >
                    Compare with another product
                </Link>
            </div>
        </main>
    );
}

type ProductCardProps = {
    product: Product;
};

function ProductCard({
    product,
}: ProductCardProps) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex gap-5">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-contain"
                        />
                    ) : (
                        <span className="text-xs text-gray-400">
                            No image
                        </span>
                    )}
                </div>

                <div className="min-w-0">
                    <p className="text-sm text-gray-500">
                        {product.brand ||
                            "Unknown brand"}
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-gray-900">
                        {product.name}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        {product.category ||
                            "Category unavailable"}
                    </p>

                    <Link
                        to={`/products/${product.barcode}`}
                        className="mt-4 inline-block text-sm font-medium text-gray-900 underline"
                    >
                        View product
                    </Link>
                </div>
            </div>
        </div>
    );
}

type ComparisonRowProps = {
    label: string;
    value1?: string | null;
    value2?: string | null;
};

function ComparisonRow({
    label,
    value1,
    value2,
}: ComparisonRowProps) {
    return (
        <tr>
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
                {label}
            </td>

            <td className="px-6 py-4 text-sm text-gray-600">
                {value1 || "Not available"}
            </td>

            <td className="px-6 py-4 text-sm text-gray-600">
                {value2 || "Not available"}
            </td>
        </tr>
    );
}

export default ComparisonPage;
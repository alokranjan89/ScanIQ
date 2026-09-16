import {
    useEffect,
    useState,
} from "react";

import type {
    FormEvent,
} from "react";
import {
    Link,
    useSearchParams,
} from "react-router-dom";

import {
    Search,
    Package,
} from "lucide-react";

import {
    searchProducts,
} from "../api/search.api";

import type {
    ProductSearchItem,
} from "../types/api";

function SearchPage() {
    const [searchParams, setSearchParams] =
        useSearchParams();

    const initialQuery =
        searchParams.get("q") ?? "";

    const [query, setQuery] =
        useState(initialQuery);

    const [results, setResults] =
        useState<ProductSearchItem[]>([]);

    const [isLoading, setIsLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [hasSearched, setHasSearched] =
        useState(Boolean(initialQuery));

    useEffect(() => {
        if (!initialQuery.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        let cancelled = false;

        const runSearch = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const products =
                    await searchProducts(
                        initialQuery,
                    );

                if (!cancelled) {
                    setResults(products);
                    setHasSearched(true);
                }
            } catch (err) {
                if (cancelled) {
                    return;
                }

                const message =
                    err instanceof Error
                        ? err.message
                        : "Unable to search products.";

                setError(message);
                setResults([]);
                setHasSearched(true);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void runSearch();

        return () => {
            cancelled = true;
        };
    }, [initialQuery]);

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const trimmedQuery =
            query.trim();

        if (!trimmedQuery) {
            setSearchParams({});
            setResults([]);
            setHasSearched(false);
            setError(null);
            return;
        }

        setSearchParams({
            q: trimmedQuery,
        });
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-400">
                        ScanIQ
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Search Products
                    </h1>

                    <p className="mt-2 text-slate-400">
                        Search by product name, brand,
                        barcode, or model number.
                    </p>
                </div>

                {/* Search form */}
                <form
                    onSubmit={handleSubmit}
                    className="mb-8"
                >
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                            />

                            <input
                                type="search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(
                                        event.target.value,
                                    )
                                }
                                placeholder="Search products..."
                                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!query.trim()}
                            className="rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Loading */}
                {isLoading && (
                    <div className="flex min-h-[250px] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-white" />

                            <p className="text-sm text-slate-400">
                                Searching products...
                            </p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {!isLoading && error && (
                    <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-6">
                        <h2 className="font-semibold text-red-300">
                            Search failed
                        </h2>

                        <p className="mt-2 text-sm text-red-400">
                            {error}
                        </p>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading &&
                    !error &&
                    hasSearched &&
                    results.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 px-6 py-16 text-center">
                            <Package
                                size={48}
                                className="mx-auto mb-4 text-slate-500"
                            />

                            <h2 className="text-xl font-semibold">
                                No products found
                            </h2>

                            <p className="mt-2 text-sm text-slate-400">
                                Try a different product name,
                                brand, barcode, or model number.
                            </p>
                        </div>
                    )}

                {/* Results */}
                {!isLoading &&
                    !error &&
                    results.length > 0 && (
                        <section>
                            <div className="mb-4">
                                <p className="text-sm text-slate-400">
                                    {results.length}{" "}
                                    {results.length === 1
                                        ? "product"
                                        : "products"}{" "}
                                    found
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {results.map(
                                    (product) => (
                                        <Link
                                            key={
                                                product.id
                                            }
                                            to={`/products/${product.barcode}`}
                                            className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:-translate-y-1 hover:border-slate-600"
                                        >
                                            {/* Image */}
                                            <div className="flex h-52 items-center justify-center bg-white p-5">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={
                                                            product.imageUrl
                                                        }
                                                        alt={
                                                            product.name
                                                        }
                                                        className="h-full w-full object-contain transition group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <Package
                                                        size={
                                                            52
                                                        }
                                                        className="text-slate-400"
                                                    />
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="p-5">
                                                <h2 className="line-clamp-2 font-semibold text-white">
                                                    {
                                                        product.name
                                                    }
                                                </h2>

                                                {product.brand && (
                                                    <p className="mt-2 text-sm text-slate-400">
                                                        {
                                                            product.brand
                                                        }
                                                    </p>
                                                )}

                                                {product.category && (
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {
                                                            product.category
                                                        }
                                                    </p>
                                                )}

                                                <div className="mt-4 border-t border-slate-800 pt-3">
                                                    <p className="text-xs text-slate-500">
                                                        Barcode
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-300">
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
                        </section>
                    )}

                {/* Initial state */}
                {!isLoading &&
                    !error &&
                    !hasSearched && (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-16 text-center">
                            <Search
                                size={48}
                                className="mx-auto mb-4 text-slate-500"
                            />

                            <h2 className="text-xl font-semibold">
                                Find a product
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                                Enter a product name, brand,
                                barcode, or model number to
                                find products in ScanIQ.
                            </p>
                        </div>
                    )}
            </div>
        </main>
    );
}

export default SearchPage;
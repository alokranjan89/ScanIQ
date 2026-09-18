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
    ArrowRight,
    Package,
    Search,
} from "lucide-react";

import { searchProducts } from "../api/search.api";
import type { ProductSearchItem } from "../types/api";

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

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to search products.",
                );
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
        <main className="page-shell">
            <div className="page-container">
                <header className="mb-8 max-w-3xl">
                    <p className="eyebrow mb-2">
                        Product catalog
                    </p>

                    <h1 className="heading-lg">
                        Search products
                    </h1>

                    <p className="mt-3 text-slate-600">
                        Search by name, brand,
                        barcode, or model number.
                    </p>
                </header>

                <form
                    onSubmit={handleSubmit}
                    className="surface mb-8 rounded-[1.75rem] p-4 sm:p-5"
                >
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search
                                size={20}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
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
                                className="input-control py-4 pl-12"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!query.trim()}
                            className="btn-primary sm:min-w-36"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {isLoading && (
                    <div className="flex min-h-[250px] items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700" />
                            <p className="text-sm text-slate-500">
                                Searching products...
                            </p>
                        </div>
                    </div>
                )}

                {!isLoading && error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                        <h2 className="font-bold text-red-800">
                            Search failed
                        </h2>
                        <p className="mt-2 text-sm text-red-700">
                            {error}
                        </p>
                    </div>
                )}

                {!isLoading &&
                    !error &&
                    hasSearched &&
                    results.length === 0 && (
                        <EmptyState
                            title="No products found"
                            text="Try another product name, brand, barcode, or model number."
                        />
                    )}

                {!isLoading &&
                    !error &&
                    results.length > 0 && (
                        <section>
                            <p className="mb-4 text-sm font-semibold text-slate-500">
                                {results.length}{" "}
                                {results.length === 1
                                    ? "product"
                                    : "products"}{" "}
                                found
                            </p>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {results.map(
                                    (product) => (
                                        <ProductResult
                                            key={
                                                product.id
                                            }
                                            product={
                                                product
                                            }
                                        />
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                {!isLoading &&
                    !error &&
                    !hasSearched && (
                        <EmptyState
                            title="Find a product"
                            text="Start with a product name, brand, barcode, or model number."
                        />
                    )}
            </div>
        </main>
    );
}

function ProductResult({
    product,
}: {
    product: ProductSearchItem;
}) {
    return (
        <Link
            to={`/products/${product.barcode}`}
            className="group panel overflow-hidden rounded-[1.5rem] transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-xl"
        >
            <div className="flex h-48 items-center justify-center bg-slate-50 p-5">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain transition group-hover:scale-105"
                    />
                ) : (
                    <Package
                        size={52}
                        className="text-slate-300"
                    />
                )}
            </div>

            <div className="p-5">
                <p className="text-xs font-semibold uppercase text-teal-700">
                    {product.category ?? "Product"}
                </p>

                <h2 className="mt-2 line-clamp-2 font-bold text-slate-950">
                    {product.name}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    {product.brand ?? "Unknown brand"}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium text-slate-400">
                        {product.barcode}
                    </p>
                    <ArrowRight
                        size={18}
                        className="text-slate-400 transition group-hover:text-teal-700"
                    />
                </div>
            </div>
        </Link>
    );
}

function EmptyState({
    title,
    text,
}: {
    title: string;
    text: string;
}) {
    return (
        <div className="surface rounded-[1.75rem] px-6 py-16 text-center">
            <Package
                size={48}
                className="mx-auto mb-4 text-slate-300"
            />
            <h2 className="text-xl font-bold text-slate-950">
                {title}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {text}
            </p>
        </div>
    );
}

export default SearchPage;

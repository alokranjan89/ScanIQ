import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";
import {
    Bot,
    GitCompare,
    Heart,
    ShieldCheck,
} from "lucide-react";

import {
    getProductByBarcode,
} from "../services/product.service";

import type {
    Product,
} from "../services/product.service";

import {
    addFavorite,
    getFavorites,
    removeFavorite,
} from "../api/favorites.api";

import {
    useAuth,
} from "../context/AuthContext";
import { getSafeUrl } from "../utils/url";


function ProductDetailsPage() {
    const { barcode } = useParams<{
        barcode: string;
    }>();

    const navigate = useNavigate();

    const {
        user,
        isLoading: isAuthLoading,
    } = useAuth();

    const [product, setProduct] =
        useState<Product | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [isFavorite, setIsFavorite] =
        useState(false);

    const [isFavoriteLoading, setIsFavoriteLoading] =
        useState(false);

    const [favoriteError, setFavoriteError] =
        useState<string | null>(null);

    /*
     * Load product.
     */
    useEffect(() => {
        const loadProduct = async () => {
            if (!barcode) {
                setError(
                    "Product barcode is missing.",
                );
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const result =
                    await getProductByBarcode(
                        barcode,
                    );

                setProduct(result);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load product.",
                );
            } finally {
                setIsLoading(false);
            }
        };

        void loadProduct();
    }, [barcode]);

    /*
     * Check whether the current product
     * is already in favorites.
     */
    useEffect(() => {
        const loadFavoriteStatus =
            async () => {
                if (
                    !user ||
                    !product
                ) {
                    setIsFavorite(false);
                    return;
                }

                try {
                    const favorites =
                        await getFavorites();

                    const favoriteExists =
                        favorites.some(
                            (favorite) =>
                                favorite.productId ===
                                product.id,
                        );

                    setIsFavorite(
                        favoriteExists,
                    );
                } catch {
                    /*
                     * Favorite status should not
                     * prevent the product page
                     * from being usable.
                     */
                    setIsFavorite(false);
                }
            };

        void loadFavoriteStatus();
    }, [user, product]);

    const handleFavorite = async () => {
        if (!product) {
            return;
        }

        if (!user) {
            navigate("/login", {
                state: {
                    from:
                        barcode
                            ? `/products/${barcode}`
                            : "/",
                },
            });

            return;
        }

        try {
            setIsFavoriteLoading(true);
            setFavoriteError(null);

            if (isFavorite) {
                await removeFavorite(
                    product.id,
                );

                setIsFavorite(false);
            } else {
                await addFavorite(
                    product.id,
                );

                setIsFavorite(true);
            }
        } catch (err) {
            setFavoriteError(
                err instanceof Error
                    ? err.message
                    : "Unable to update favorite.",
            );
        } finally {
            setIsFavoriteLoading(false);
        }
    };

    if (isLoading) {
        return (
            <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                    <p className="text-sm text-gray-600">
                        Loading product...
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="mx-auto max-w-6xl px-4 py-10">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <h1 className="text-lg font-semibold text-red-800">
                        Product unavailable
                    </h1>

                    <p className="mt-2 text-sm text-red-700">
                        {error}
                    </p>

                    <Link
                        to="/"
                        className="mt-5 inline-block rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
                    >
                        Back to home
                    </Link>
                </div>
            </main>
        );
    }

    if (!product) {
        return null;
    }

    const ingredients =
        product.ingredients ?? [];

    const attributes =
        product.attributes ?? [];

    const prices =
        product.prices ?? [];

    const sources =
        product.sources ?? [];

    const nutrition =
        product.nutrition ?? null;

    return (
        <main className="page-shell">
            <div className="page-container">
            {/* Back */}
            <Link
                to="/"
                className="text-sm font-semibold text-slate-500 hover:text-slate-950"
            >
                ← Back
            </Link>

            {/* Product header */}
            <section className="surface mt-6 rounded-[2rem] p-6">
                <div className="grid gap-8 md:grid-cols-[280px_1fr]">
                    {/* Image */}
                    <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl bg-gray-100">
                        {product.imageUrl ? (
                            <img
                                src={
                                    product.imageUrl
                                }
                                alt={
                                    product.name
                                }
                                className="max-h-[280px] w-full object-contain"
                            />
                        ) : (
                            <span className="text-sm text-gray-400">
                                No image available
                            </span>
                        )}
                    </div>

                    {/* Information */}
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            {product.brand ||
                                "Unknown brand"}
                        </p>

                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                            {product.name}
                        </h1>

                        {product.category && (
                            <p className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                                {
                                    product.category
                                }
                            </p>
                        )}

                        {product.description && (
                            <p className="mt-6 text-sm leading-7 text-gray-600">
                                {
                                    product.description
                                }
                            </p>
                        )}

                        {/* Actions */}
                        <div className="mt-7 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={
                                    handleFavorite
                                }
                                disabled={
                                    isFavoriteLoading ||
                                    isAuthLoading
                                }
                                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Heart size={17} />
                                {isFavoriteLoading
                                    ? "Updating..."
                                    : isFavorite
                                      ? "Favorited"
                                      : "Favorite"}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/compare?productId1=${product.id}`,
                                    )
                                }
                                className="btn-secondary"
                            >
                                <GitCompare size={17} />
                                Compare
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/products/${product.barcode}/ai`,
                                    )
                                }
                                className="btn-primary"
                            >
                                <Bot size={17} />
                                Ask AI
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/products/${product.id}/verification`,
                                    )
                                }
                                className="btn-secondary"
                            >
                                <ShieldCheck size={17} />
                                Verify Product
                            </button>
                        </div>

                        {favoriteError && (
                            <p className="mt-3 text-sm text-red-600">
                                {
                                    favoriteError
                                }
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Basic information */}
            <section className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                    Product Information
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoRow
                        label="Barcode"
                        value={
                            product.barcode
                        }
                    />

                    <InfoRow
                        label="Brand"
                        value={
                            product.brand
                        }
                    />

                    <InfoRow
                        label="Category"
                        value={
                            product.category
                        }
                    />

                    <InfoRow
                        label="Manufacturer"
                        value={
                            product.manufacturer
                        }
                    />

                    <InfoRow
                        label="Country"
                        value={
                            product.country
                        }
                    />

                    <InfoRow
                        label="Model Number"
                        value={
                            product.modelNumber
                        }
                    />
                </div>
            </section>

            {/* Nutrition */}
            {nutrition && (
                <section className="mt-8">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Nutrition
                    </h2>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <NutritionItem
                            label="Calories"
                            value={
                                nutrition.calories
                            }
                        />

                        <NutritionItem
                            label="Protein"
                            value={
                                nutrition.protein
                            }
                        />

                        <NutritionItem
                            label="Carbohydrates"
                            value={
                                nutrition.carbohydrates
                            }
                        />

                        <NutritionItem
                            label="Fat"
                            value={
                                nutrition.fat
                            }
                        />

                        <NutritionItem
                            label="Saturated Fat"
                            value={
                                nutrition.saturatedFat
                            }
                        />

                        <NutritionItem
                            label="Sugars"
                            value={
                                nutrition.sugars
                            }
                        />

                        <NutritionItem
                            label="Fiber"
                            value={
                                nutrition.fiber
                            }
                        />

                        <NutritionItem
                            label="Sodium"
                            value={
                                nutrition.sodium
                            }
                        />
                    </div>
                </section>
            )}

            {/* Ingredients */}
            <section className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                    Ingredients
                </h2>

                {ingredients.length ===
                0 ? (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                        <p className="text-sm text-gray-500">
                            Ingredient information is
                            not available.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 space-y-3">
                        {ingredients.map(
                            (
                                ingredient,
                                index,
                            ) => (
                                <div
                                    key={`${ingredient.name}-${index}`}
                                    className="rounded-xl border border-gray-200 bg-white p-5"
                                >
                                    <p className="font-medium text-gray-900">
                                        {
                                            ingredient.name
                                        }
                                    </p>

                                    {ingredient.description && (
                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                            {
                                                ingredient.description
                                            }
                                        </p>
                                    )}
                                </div>
                            ),
                        )}
                    </div>
                )}
            </section>

            {/* Attributes */}
            <section className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                    Specifications
                </h2>

                {attributes.length ===
                0 ? (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                        <p className="text-sm text-gray-500">
                            No additional specifications
                            are available.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {attributes.map(
                            (attribute) => (
                                <InfoRow
                                    key={
                                        attribute.key
                                    }
                                    label={
                                        attribute.key
                                    }
                                    value={
                                        attribute.value
                                    }
                                />
                            ),
                        )}
                    </div>
                )}
            </section>

            {/* Prices */}
            <section className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                    Prices
                </h2>

                {prices.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                        <p className="text-sm text-gray-500">
                            Price information is not
                            available.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 space-y-3">
                        {prices.map(
                            (
                                price,
                                index,
                            ) => (
                                <div
                                    key={`${price.amount}-${price.currency}-${index}`}
                                    className="rounded-xl border border-gray-200 bg-white p-5"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {
                                                    price.priceType
                                                }
                                            </p>

                                            {price.merchant && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {
                                                        price.merchant
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-lg font-semibold text-gray-900">
                                            {
                                                price.currency
                                            }{" "}
                                            {
                                                price.amount
                                            }
                                        </p>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </section>

            {/* Sources */}
            <section className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                    Data Sources
                </h2>

                {sources.length ===
                0 ? (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                        <p className="text-sm text-gray-500">
                            No external sources are
                            available.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 space-y-3">
                        {sources.map(
                            (
                                source,
                                index,
                            ) => (
                                <div
                                    key={`${source.provider}-${index}`}
                                    className="rounded-xl border border-gray-200 bg-white p-5"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {
                                                    source.provider
                                                }
                                            </p>

                                            {source.isPrimary && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Primary
                                                    source
                                                </p>
                                            )}
                                        </div>

                                        {(() => {
                                            const safeUrl = getSafeUrl(
                                                source.sourceUrl,
                                            );
                                            return safeUrl ? (
                                                <a
                                                    href={safeUrl}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                    className="text-sm font-medium text-gray-900 underline"
                                                >
                                                    View source
                                                </a>
                                            ) : null;
                                        })()}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </section>
            </div>
        </main>
    );
}

type InfoRowProps = {
    label: string;
    value?: unknown;
};

function InfoRow({
    label,
    value,
}: InfoRowProps) {
    const displayValue =
        value === null ||
        value === undefined ||
        value === ""
            ? "N/A"
            : String(value);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p className="mt-2 break-words text-sm font-medium text-gray-900">
                {displayValue}
            </p>
        </div>
    );
}

type NutritionItemProps = {
    label: string;
    value?: unknown;
};

function NutritionItem({
    label,
    value,
}: NutritionItemProps) {
    const displayValue =
        value === null ||
        value === undefined ||
        value === ""
            ? "N/A"
            : String(value);

    return (
        <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
                {displayValue}
            </p>
        </div>
    );
}

export default ProductDetailsPage;

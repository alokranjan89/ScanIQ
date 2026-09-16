import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Heart,
    Package,
    Trash2,
} from "lucide-react";

import {
    getFavorites,
    removeFavorite,
} from "../api/favorites.api";

import type { Favorite } from "../types/api";

function FavoritesPage() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadFavorites = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getFavorites();

            setFavorites(data);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to load favorites.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadFavorites();
    }, [loadFavorites]);

    const handleRemove = async (productId: number) => {
        try {
            setDeletingId(productId);

            await removeFavorite(productId);

            setFavorites((current) =>
                current.filter(
                    (favorite) =>
                        favorite.productId !== productId,
                ),
            );
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to remove favorite.";

            setError(message);
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-10">
                <div className="flex min-h-[50vh] items-center justify-center">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                        <p className="text-sm text-gray-600">
                            Loading favorites...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gray-100 p-3">
                        <Heart
                            size={24}
                            className="text-gray-900"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Favorites
                        </h1>

                        <p className="text-sm text-gray-500">
                            Products you've saved
                        </p>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm text-red-700">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() => void loadFavorites()}
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!error && favorites.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                    <Heart
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                    />

                    <h2 className="text-lg font-semibold text-gray-900">
                        No favorites yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                        Save products you want to quickly access
                        later.
                    </p>

                    <Link
                        to="/scan"
                        className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Scan a Product
                    </Link>
                </div>
            )}

            {/* Favorites */}
            {!error && favorites.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {favorites.map((favorite) => {
                        const product = favorite.product;

                        return (
                            <div
                                key={favorite.id}
                                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                            >
                                {/* Image */}
                                <Link
                                    to={
                                        product
                                            ? `/products/${product.barcode}`
                                            : "#"
                                    }
                                    className="block"
                                >
                                    <div className="flex h-48 items-center justify-center bg-gray-50">
                                        {product?.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="h-full w-full object-contain p-4"
                                            />
                                        ) : (
                                            <Package
                                                size={48}
                                                className="text-gray-400"
                                            />
                                        )}
                                    </div>
                                </Link>

                                {/* Details */}
                                <div className="p-4">
                                    {product ? (
                                        <>
                                            <Link
                                                to={`/products/${product.barcode}`}
                                            >
                                                <h2 className="line-clamp-2 font-semibold text-gray-900 hover:underline">
                                                    {product.name}
                                                </h2>
                                            </Link>

                                            {product.brand && (
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {product.brand}
                                                </p>
                                            )}

                                            <p className="mt-2 text-xs text-gray-400">
                                                Barcode:{" "}
                                                {product.barcode}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">
                                            Product information
                                            unavailable
                                        </p>
                                    )}

                                    {/* Remove button */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            void handleRemove(
                                                favorite.productId,
                                            )
                                        }
                                        disabled={
                                            deletingId ===
                                            favorite.productId
                                        }
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {deletingId ===
                                        favorite.productId ? (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}

                                        Remove Favorite
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

export default FavoritesPage;
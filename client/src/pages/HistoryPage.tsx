import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    Trash2,
    History as HistoryIcon,
    Package,
} from "lucide-react";

import {
    deleteScanHistory,
    getScanHistory,
} from "../api/scans.api";

import type { ScanHistoryItem } from "../types/api";

function HistoryPage() {
    const [history, setHistory] = useState<ScanHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadHistory = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const data = await getScanHistory();

            setHistory(data);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to load scan history.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadHistory();
    }, [loadHistory]);

    const handleDelete = async (scanId: number) => {
        try {
            setDeletingId(scanId);

            await deleteScanHistory(scanId);

            setHistory((current) =>
                current.filter(
                    (item) => item.id !== scanId,
                ),
            );
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Failed to delete scan.";

            setError(message);
        } finally {
            setDeletingId(null);
        }
    };

    if (isLoading) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-10">
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                        <p className="text-sm text-gray-600">
                            Loading scan history...
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
                <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-xl bg-gray-100 p-3">
                        <HistoryIcon
                            size={24}
                            className="text-gray-900"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Scan History
                        </h1>

                        <p className="text-sm text-gray-500">
                            Products you scanned recently
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
                        onClick={() => void loadHistory()}
                        className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!error && history.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                    <Package
                        size={48}
                        className="mx-auto mb-4 text-gray-400"
                    />

                    <h2 className="text-lg font-semibold text-gray-900">
                        No scans yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                        Scan a product barcode or QR code and it
                        will appear here.
                    </p>

                    <Link
                        to="/scan"
                        className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        Scan a Product
                    </Link>
                </div>
            )}

            {/* History list */}
            {!error && history.length > 0 && (
                <div className="space-y-4">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            {/* Product image */}
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                                {item.product?.imageUrl ? (
                                    <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="h-full w-full object-contain"
                                    />
                                ) : (
                                    <Package
                                        size={28}
                                        className="text-gray-400"
                                    />
                                )}
                            </div>

                            {/* Product information */}
                            <div className="min-w-0 flex-1">
                                {item.product ? (
                                    <Link
                                        to={`/products/${item.product.barcode}`}
                                        className="block"
                                    >
                                        <h2 className="truncate font-semibold text-gray-900 hover:underline">
                                            {item.product.name}
                                        </h2>

                                        {item.product.brand && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {item.product.brand}
                                            </p>
                                        )}
                                    </Link>
                                ) : (
                                    <h2 className="font-semibold text-gray-900">
                                        Product
                                    </h2>
                                )}

                                <p className="mt-1 text-xs text-gray-400">
                                    Barcode:{" "}
                                    {item.scannedCode}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                    {new Date(
                                        item.createdAt,
                                    ).toLocaleString()}
                                </p>
                            </div>

                            {/* Delete */}
                            <button
                                type="button"
                                onClick={() =>
                                    void handleDelete(item.id)
                                }
                                disabled={
                                    deletingId === item.id
                                }
                                aria-label="Delete scan"
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deletingId === item.id ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                                ) : (
                                    <Trash2 size={20} />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}

export default HistoryPage;
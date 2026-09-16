import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import BarcodeScanner from "../components/BarcodeScanner";

import { getProductByBarcode } from "../services/product.service";

import {
    createScanHistory,
} from "../api/scans.api";

import { useAuth } from "../context/AuthContext";

function ScannerPage() {
    const navigate = useNavigate();

    const {
        isAuthenticated,
    } = useAuth();

    const [isScanning, setIsScanning] =
        useState(false);

    const [barcode, setBarcode] =
        useState("");

    const [isLoading, setIsLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleScan = useCallback(
        async (decodedBarcode: string) => {
            const normalizedBarcode =
                decodedBarcode.trim();

            if (
                !normalizedBarcode ||
                isLoading
            ) {
                return;
            }

            setBarcode(normalizedBarcode);
            setError("");
            setIsScanning(false);
            setIsLoading(true);

            try {
                /*
                 * Step 1:
                 * Find the product using the scanned barcode.
                 */
                const product =
                    await getProductByBarcode(
                        normalizedBarcode,
                    );

                /*
                 * Step 2:
                 * Save the scan for authenticated users.
                 *
                 * We don't send userId from the frontend.
                 * The backend gets the user from the JWT.
                 */
                if (isAuthenticated) {
                    try {
                        await createScanHistory(
                            product.id,
                            normalizedBarcode,
                        );
                    } catch {
                        /*
                         * A history failure should NOT prevent
                         * the user from seeing the product.
                         *
                         * Product identification is the primary
                         * scanner operation.
                         */
                    }
                }

                /*
                 * Step 3:
                 * ProductDetailsPage expects a barcode.
                 */
                navigate(
                    `/products/${product.barcode}`,
                );
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Unable to find this product.";

                setError(message);
            } finally {
                setIsLoading(false);
            }
        },
        [
            isLoading,
            isAuthenticated,
            navigate,
        ],
    );

    const handleScannerError =
        useCallback(
            (message: string) => {
                setError(message);
                setIsScanning(false);
            },
            [],
        );

    const handleManualSearch =
        async () => {
            const normalizedBarcode =
                barcode.trim();

            if (!normalizedBarcode) {
                setError(
                    "Please enter a barcode.",
                );

                return;
            }

            await handleScan(
                normalizedBarcode,
            );
        };

    const handleStartScanner = () => {
        setError("");
        setIsScanning(true);
    };

    const handleCancelScanner = () => {
        setIsScanning(false);
        setError("");
    };

    return (
        <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
            <div className="mx-auto max-w-2xl">

                {/* Header */}
                <header className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center text-sm text-slate-400 transition hover:text-white"
                    >
                        ← Back to home
                    </Link>

                    <div className="mt-6">
                        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-400">
                            ScanIQ
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight">
                            Scan a product
                        </h1>

                        <p className="mt-2 text-slate-400">
                            Scan a QR code or barcode to identify the product.
                        </p>
                    </div>
                </header>

                {/* Camera scanner */}
                {isScanning ? (
                    <section className="space-y-4">
                        <div className="overflow-hidden rounded-2xl border border-slate-800">
                            <BarcodeScanner
                                onScan={handleScan}
                                onError={handleScannerError}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={
                                handleCancelScanner
                            }
                            disabled={isLoading}
                            className="w-full rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel scanning
                        </button>
                    </section>
                ) : (
                    <section className="space-y-6">

                        {/* Camera card */}
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                            <h2 className="text-xl font-semibold">
                                Camera scanner
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                                Use your device camera to scan a supported QR code
                                or barcode.
                            </p>

                            <button
                                type="button"
                                onClick={
                                    handleStartScanner
                                }
                                disabled={isLoading}
                                className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoading
                                    ? "Finding product..."
                                    : "Open camera"}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800" />
                            </div>

                            <div className="relative flex justify-center">
                                <span className="bg-slate-950 px-4 text-sm text-slate-500">
                                    OR
                                </span>
                            </div>
                        </div>

                        {/* Manual barcode */}
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();

                                void handleManualSearch();
                            }}
                            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                        >
                            <h2 className="text-xl font-semibold">
                                Enter barcode manually
                            </h2>

                            <p className="mt-2 text-sm text-slate-400">
                                Enter an EAN, UPC, or other supported product
                                barcode.
                            </p>

                            <label
                                htmlFor="barcode"
                                className="mt-5 block text-sm font-medium text-slate-300"
                            >
                                Barcode
                            </label>

                            <input
                                id="barcode"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                value={barcode}
                                onChange={(event) => {
                                    setBarcode(
                                        event.target.value,
                                    );

                                    setError("");
                                }}
                                placeholder="e.g. 012993441012"
                                disabled={isLoading}
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-4 w-full rounded-xl border border-slate-600 px-5 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoading
                                    ? "Finding product..."
                                    : "Find product"}
                            </button>
                        </form>
                    </section>
                )}

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mt-6 rounded-xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-300"
                    >
                        {error}
                    </div>
                )}

                {/* Supported formats */}
                <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                    <p className="text-xs leading-5 text-slate-500">
                        Supported formats include QR Code, EAN-8,
                        EAN-13, UPC-A, and UPC-E. Camera access
                        requires permission from your browser.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default ScannerPage;
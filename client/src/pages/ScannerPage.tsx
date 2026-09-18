import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Camera,
    Keyboard,
    MoveLeft,
    ScanLine,
} from "lucide-react";

import BarcodeScanner from "../components/BarcodeScanner";
import { getProductByBarcode } from "../services/product.service";
import { createScanHistory } from "../api/scans.api";
import { useAuth } from "../context/AuthContext";

function ScannerPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

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
                const product =
                    await getProductByBarcode(
                        normalizedBarcode,
                    );

                if (isAuthenticated) {
                    try {
                        await createScanHistory(
                            product.id,
                            normalizedBarcode,
                        );
                    } catch {
                        // History should never block product identification.
                    }
                }

                navigate(
                    `/products/${product.barcode}`,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to find this product.",
                );
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

    return (
        <main className="page-shell">
            <div className="mx-auto max-w-3xl">
                <header className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
                    >
                        <MoveLeft size={17} />
                        Back to home
                    </Link>

                    <div className="mt-6">
                        <p className="eyebrow mb-2">
                            ScanIQ
                        </p>

                        <h1 className="heading-lg">
                            Scan a product
                        </h1>

                        <p className="mt-3 max-w-2xl text-slate-600">
                            Use your camera or type a
                            barcode to identify a
                            product and open its
                            intelligence profile.
                        </p>
                    </div>
                </header>

                {isScanning ? (
                    <section className="space-y-4">
                        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-950 shadow-2xl shadow-slate-900/15">
                            <BarcodeScanner
                                onScan={handleScan}
                                onError={(message) => {
                                    setError(message);
                                    setIsScanning(false);
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setIsScanning(false);
                                setError("");
                            }}
                            disabled={isLoading}
                            className="btn-secondary w-full"
                        >
                            Cancel scanning
                        </button>
                    </section>
                ) : (
                    <section className="space-y-6">
                        <div className="surface rounded-[1.75rem] p-6">
                            <div className="flex items-start gap-4">
                                <span className="icon-tile">
                                    <Camera size={22} />
                                </span>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Camera scanner
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        Point your camera at
                                        a product QR code or
                                        barcode.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setError("");
                                    setIsScanning(true);
                                }}
                                disabled={isLoading}
                                className="btn-primary mt-6 w-full"
                            >
                                <ScanLine size={18} />
                                {isLoading
                                    ? "Finding product..."
                                    : "Open camera"}
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>

                            <div className="relative flex justify-center">
                                <span className="bg-[#f5f7fb] px-4 text-sm font-semibold text-slate-400">
                                    OR
                                </span>
                            </div>
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                void handleManualSearch();
                            }}
                            className="surface rounded-[1.75rem] p-6"
                        >
                            <div className="flex items-start gap-4">
                                <span className="icon-tile bg-orange-100 text-orange-700">
                                    <Keyboard size={22} />
                                </span>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Manual entry
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        Enter an EAN, UPC, or
                                        other supported
                                        product barcode.
                                    </p>
                                </div>
                            </div>

                            <label
                                htmlFor="barcode"
                                className="mt-5 block text-sm font-semibold text-slate-700"
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
                                className="input-control mt-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-secondary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isLoading
                                    ? "Finding product..."
                                    : "Find product"}
                            </button>
                        </form>
                    </section>
                )}

                {error && (
                    <div
                        role="alert"
                        className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                    >
                        {error}
                    </div>
                )}

                <div className="soft-panel mt-8 rounded-2xl p-4">
                    <p className="text-xs leading-5 text-slate-500">
                        Supported formats include QR
                        Code, EAN-8, EAN-13, UPC-A,
                        and UPC-E. Camera access
                        requires permission from your
                        browser.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default ScannerPage;

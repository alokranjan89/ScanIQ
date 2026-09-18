import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
    Camera,
    CheckCircle2,
    Keyboard,
    MoveLeft,
    ScanLine,
    Sparkles,
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
            <div className="mx-auto max-w-4xl">

                {/* Header */}
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
                            Scan a barcode or QR code to
                            instantly identify a product
                            and explore its intelligence
                            profile.
                        </p>
                    </div>
                </header>

                {/* Scanner */}
                {isScanning ? (
                    <section className="space-y-5">

                        <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-900/20">

                            {/* Scanner Header */}
                            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-5 py-4">

                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400">
                                        <ScanLine
                                            size={19}
                                        />

                                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                                    </span>

                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            Scanner active
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            Align the code inside the frame
                                        </p>
                                    </div>
                                </div>

                                <span className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-[11px] font-semibold text-teal-300">
                                    Scanning
                                </span>
                            </div>

                            {/* Camera Area */}
                            <div className="relative">

                                <BarcodeScanner
                                    onScan={handleScan}
                                    onError={(message) => {
                                        setError(message);
                                        setIsScanning(false);
                                    }}
                                />

                                {/* Scanner Overlay */}
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                                    {/* Dark overlay */}
                                    <div className="absolute inset-0 bg-slate-950/10" />

                                    {/* Scan frame */}
                                    <div className="relative h-52 w-[82%] max-w-xl sm:h-60">

                                        {/* Top left */}
                                        <span className="absolute left-0 top-0 h-9 w-9 rounded-tl-2xl border-l-[3px] border-t-[3px] border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.35)]" />

                                        {/* Top right */}
                                        <span className="absolute right-0 top-0 h-9 w-9 rounded-tr-2xl border-r-[3px] border-t-[3px] border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.35)]" />

                                        {/* Bottom left */}
                                        <span className="absolute bottom-0 left-0 h-9 w-9 rounded-bl-2xl border-b-[3px] border-l-[3px] border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.35)]" />

                                        {/* Bottom right */}
                                        <span className="absolute bottom-0 right-0 h-9 w-9 rounded-br-2xl border-b-[3px] border-r-[3px] border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.35)]" />

                                        {/* Animated scan line */}
                                        <div className="absolute left-5 right-5 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded-full bg-teal-400 shadow-[0_0_14px_rgba(45,212,191,0.9)] animate-pulse" />

                                        {/* Center indicator */}
                                        <div className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-teal-300/40 bg-slate-950/30">
                                            <ScanLine
                                                size={15}
                                                className="text-teal-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scanner Instructions */}
                            <div className="border-t border-white/10 bg-slate-950 px-5 py-5 text-center">

                                <div className="mx-auto flex max-w-md items-center justify-center gap-2 text-sm font-medium text-white">
                                    <Sparkles
                                        size={15}
                                        className="text-teal-400"
                                    />

                                    Point your camera at a
                                    barcode or QR code
                                </div>

                                <p className="mt-1.5 text-xs text-slate-400">
                                    Keep the code inside the
                                    highlighted frame.
                                </p>
                            </div>
                        </div>

                        {/* Cancel */}
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

                        {/* Camera Card */}
                        <div className="surface overflow-hidden rounded-[2rem]">

                            <div className="p-6 sm:p-7">

                                <div className="flex items-start gap-4">

                                    <span className="icon-tile">
                                        <Camera size={22} />
                                    </span>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-950">
                                            Camera scanner
                                        </h2>

                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Quickly scan a product
                                            barcode or QR code
                                            using your camera.
                                        </p>
                                    </div>
                                </div>

                                {/* Scanner Benefits */}
                                <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">

                                    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">
                                        <p className="text-xs font-semibold text-slate-800">
                                            Fast
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                            Instant scan
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">
                                        <p className="text-xs font-semibold text-slate-800">
                                            QR + Barcode
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                            Multiple formats
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 px-3 py-3 text-center">
                                        <p className="text-xs font-semibold text-slate-800">
                                            Secure
                                        </p>

                                        <p className="mt-0.5 text-[10px] text-slate-400">
                                            Browser camera
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
                        </div>

                        {/* OR Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>

                            <div className="relative flex justify-center">
                                <span className="bg-[#f5f7fb] px-4 text-xs font-bold tracking-wider text-slate-400">
                                    OR
                                </span>
                            </div>
                        </div>

                        {/* Manual Entry */}
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                void handleManualSearch();
                            }}
                            className="surface rounded-[2rem] p-6 sm:p-7"
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
                                        Already have the barcode?
                                        Enter it manually.
                                    </p>
                                </div>
                            </div>

                            <label
                                htmlFor="barcode"
                                className="mt-6 block text-sm font-semibold text-slate-700"
                            >
                                Barcode
                            </label>

                            <div className="relative mt-2">

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
                                    className="input-control pr-24 disabled:cursor-not-allowed disabled:opacity-50"
                                />

                                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    UPC / EAN
                                </span>
                            </div>

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

                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
                    >
                        <span className="mt-0.5">
                            !
                        </span>

                        <span>{error}</span>
                    </div>
                )}

                {/* Supported formats */}
                <div className="soft-panel mt-8 rounded-2xl p-4">
                    <div className="flex items-start gap-3">

                        <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-teal-600"
                        />

                        <p className="text-xs leading-5 text-slate-500">
                            Supported formats include QR
                            Code, EAN-8, EAN-13, UPC-A,
                            and UPC-E. Camera access
                            requires permission from your
                            browser.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default ScannerPage;
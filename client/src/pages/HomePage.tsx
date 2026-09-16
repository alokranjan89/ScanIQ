import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

function HomePage() {
    const navigate = useNavigate();

    const [barcode, setBarcode] =
        useState("");

    const [error, setError] =
        useState("");

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const value =
            barcode.trim();

        setError("");

        if (!value) {
            setError(
                "Please enter a barcode.",
            );
            return;
        }

        if (!/^\d+$/.test(value)) {
            setError(
                "Barcode must contain only numbers.",
            );
            return;
        }

        if (
            ![8, 12, 13].includes(
                value.length,
            )
        ) {
            setError(
                "Please enter a valid 8, 12, or 13 digit barcode.",
            );
            return;
        }

        navigate(
            `/products/${encodeURIComponent(
                value,
            )}`,
        );
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6">
                <div className="w-full max-w-xl text-center">

                    {/* Hero */}
                    <div className="mb-10">
                        <h1 className="text-5xl font-bold tracking-tight">
                            ScanIQ
                        </h1>

                        <p className="mt-4 text-lg text-slate-400">
                            Scan. Verify. Understand.
                        </p>
                    </div>

                    {/* Barcode lookup */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
                        <h2 className="text-2xl font-semibold">
                            Find a Product
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Enter a product barcode to get
                            product information and
                            verification details.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-6"
                        >
                            <label
                                htmlFor="barcode"
                                className="mb-2 block text-left text-sm font-medium text-slate-300"
                            >
                                Barcode
                            </label>

                            <input
                                id="barcode"
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                placeholder="Enter barcode e.g. 8904340720005"
                                value={barcode}
                                onChange={(event) => {
                                    setBarcode(
                                        event.target.value,
                                    );
                                    setError("");
                                }}
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />

                            {error && (
                                <p className="mt-2 text-left text-sm text-red-400">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 active:scale-[0.99]"
                            >
                                Find Product
                            </button>
                        </form>

                        <div className="mt-6 border-t border-slate-800 pt-5">
                            <p className="text-xs text-slate-500">
                                Supported barcode lengths:
                                8, 12, and 13 digits
                            </p>
                        </div>
                    </div>

                    {/* Alternative actions */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">

                        {/* Camera scanner */}
                        <Link
                            to="/scan"
                            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
                        >
                            <span className="block text-base">
                                📷 Scan with Camera
                            </span>

                            <span className="mt-1 block text-xs text-slate-500">
                                Scan a QR code or barcode
                            </span>
                        </Link>

                        {/* Search */}
                        <Link
                            to="/search"
                            className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 font-medium text-white transition hover:border-slate-500 hover:bg-slate-800"
                        >
                            <span className="block text-base">
                                🔎 Search Products
                            </span>

                            <span className="mt-1 block text-xs text-slate-500">
                                Search by name, brand, or barcode
                            </span>
                        </Link>
                    </div>

                    <p className="mt-6 text-sm text-slate-500">
                        Scan, search, and understand products
                        with ScanIQ.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default HomePage;
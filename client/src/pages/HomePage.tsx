import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    BadgeCheck,
    Bot,
    GitCompare,
    ScanLine,
    Search,
    ShieldCheck,
} from "lucide-react";

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
        <main className="page-shell">
            <div className="page-container">
                <section className="grid min-h-[calc(100vh-9rem)] items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="max-w-3xl">
                        <p className="eyebrow mb-4">
                            Scan. Verify. Understand.
                        </p>

                        <h1 className="heading-xl">
                            Product intelligence at the
                            point of scan.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                            ScanIQ turns barcodes into
                            structured product facts,
                            verification signals, plain
                            language AI answers, and
                            side-by-side comparisons.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                to="/scan"
                                className="btn-primary"
                            >
                                <ScanLine size={19} />
                                Open scanner
                            </Link>

                            <Link
                                to="/search"
                                className="btn-secondary"
                            >
                                <Search size={19} />
                                Search catalog
                            </Link>
                        </div>

                        <div className="mt-10 grid gap-3 sm:grid-cols-3">
                            {[
                                {
                                    icon: ShieldCheck,
                                    label: "Source-aware verification",
                                },
                                {
                                    icon: Bot,
                                    label: "Grounded AI answers",
                                },
                                {
                                    icon: GitCompare,
                                    label: "Product comparison",
                                },
                            ].map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.label}
                                        className="soft-panel rounded-2xl p-4"
                                    >
                                        <Icon
                                            size={20}
                                            className="text-teal-700"
                                        />
                                        <p className="mt-3 text-sm font-semibold text-slate-700">
                                            {item.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="surface rounded-[2rem] p-5 sm:p-7">
                        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 text-slate-950 shadow-xl shadow-slate-900/5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="eyebrow text-teal-700">
                                        Quick lookup
                                    </p>
                                    <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                                        Enter barcode
                                    </h2>
                                </div>

                                <span className="icon-tile">
                                    <ScanLine size={24} />
                                </span>
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="mt-6"
                            >
                                <label
                                    htmlFor="barcode"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Product barcode
                                </label>

                                <input
                                    id="barcode"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="e.g. 8904340720005"
                                    value={barcode}
                                    onChange={(event) => {
                                        setBarcode(
                                            event.target.value,
                                        );
                                        setError("");
                                    }}
                                    className="w-full rounded-2xl border border-slate-300 bg-slate-50/60 px-4 py-4 text-lg font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                                />

                                {error && (
                                    <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    className="btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white shadow-lg shadow-teal-700/20"
                                >
                                    Find product
                                    <ArrowRight size={18} />
                                </button>
                            </form>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                                    <BadgeCheck
                                        size={18}
                                        className="text-teal-700"
                                    />
                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                        8, 12, 13 digit support
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                                    <ShieldCheck
                                        size={18}
                                        className="text-amber-600"
                                    />
                                    <p className="mt-2 text-sm font-semibold text-slate-800">
                                        Clear verification status
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default HomePage;

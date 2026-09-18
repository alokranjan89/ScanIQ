import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    BadgeCheck,
    Bot,
    FileText,
    GitCompare,
    Search,
    ScanLine,
    ShieldCheck,
} from "lucide-react";

const SUPPORTED_BARCODE_LENGTHS = [8, 12, 13];

const FEATURES = [
    {
        icon: ShieldCheck,
        label: "Source-aware verification",
    },
    {
        icon: Bot,
        label: "AI-powered explanations",
    },
    {
        icon: GitCompare,
        label: "Compare products",
    },
];

const STEPS = [
    {
        number: "01",
        icon: ScanLine,
        title: "Scan",
        description: "Scan a product barcode or QR code with your camera.",
    },
    {
        number: "02",
        icon: Search,
        title: "Identify",
        description: "Find the product and retrieve available information.",
    },
    {
        number: "03",
        icon: Bot,
        title: "Understand",
        description: "Explore product details and ask questions with AI.",
    },
    {
        number: "04",
        icon: ShieldCheck,
        title: "Verify",
        description: "Check information consistency across available sources.",
    },
];

const EXPLORE_FEATURES = [
    {
        icon: FileText,
        title: "Product details",
        description: "Brand, category, ingredients, nutrition and more.",
    },
    {
        icon: Bot,
        title: "Ask AI",
        description:
            "Get plain-language explanations based on product information.",
    },
    {
        icon: GitCompare,
        title: "Compare",
        description:
            "Put products side by side and inspect their differences.",
    },
    {
        icon: ShieldCheck,
        title: "Verification",
        description:
            "See how available sources agree or differ on key information.",
    },
];

function HomePage() {
    const navigate = useNavigate();

    const [barcode, setBarcode] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const value = barcode.trim();

        setError("");

        if (!value) {
            setError("Please enter a barcode.");
            return;
        }

        if (!/^\d+$/.test(value)) {
            setError("Barcode must contain only numbers.");
            return;
        }

        if (!SUPPORTED_BARCODE_LENGTHS.includes(value.length)) {
            setError("Please enter a valid 8, 12, or 13 digit barcode.");
            return;
        }

        navigate(`/products/${encodeURIComponent(value)}`);
    };

    return (
        <main className="page-shell">
            <div className="page-container">

                {/* =====================================================
                    HERO
                ====================================================== */}

                <section className="grid min-h-[calc(100vh-9rem)] items-center gap-10 py-8 lg:grid-cols-[1.08fr_0.92fr]">

                    {/* Hero Content */}
                    <div className="max-w-3xl">

                        <p className="eyebrow mb-4">
                            Scan. Verify. Understand.
                        </p>

                        <h1 className="heading-xl">
                            Know more about the products you buy.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                            Scan a barcode or QR code to discover product
                            information, ingredients, nutrition, AI
                            explanations, comparisons, and verification
                            signals — all in one place.
                        </p>

                        {/* Main Actions */}
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                            <Link
                                to="/scan"
                                className="btn-primary"
                            >
                                <ScanLine size={19} />
                                Scan a product
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                to="/search"
                                className="btn-secondary"
                            >
                                <Search size={19} />
                                Search products
                            </Link>

                        </div>

                        {/* Feature Cards */}
                        <div className="mt-8 grid gap-3 sm:grid-cols-3">

                            {FEATURES.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <div
                                        key={feature.label}
                                        className="soft-panel flex items-center gap-3 p-4"
                                    >

                                        <div className="icon-tile shrink-0">
                                            <Icon size={20} />
                                        </div>

                                        <p className="text-sm font-semibold leading-5 text-slate-700">
                                            {feature.label}
                                        </p>

                                    </div>
                                );
                            })}

                        </div>

                    </div>


                    {/* Quick Lookup */}
                    <div className="lg:pl-4">

                        <div className="surface rounded-[2rem] p-5 sm:p-7">

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">

                                <div className="flex items-start justify-between gap-4">

                                    <div>

                                        <p className="eyebrow text-teal-700">
                                            Quick lookup
                                        </p>

                                        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                            Find a product
                                        </h2>

                                        <p className="mt-2 text-sm text-slate-500">
                                            Enter the barcode printed on the
                                            product.
                                        </p>

                                    </div>

                                    <span className="icon-tile shrink-0">
                                        <ScanLine size={22} />
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
                                        maxLength={13}
                                        value={barcode}
                                        onChange={(event) => {
                                            setBarcode(
                                                event.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            );

                                            setError("");
                                        }}
                                        placeholder="e.g. 012993441012"
                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                                    />

                                    {error && (
                                        <p className="mt-2 text-sm font-medium text-red-600">
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn-primary mt-3 w-full justify-center"
                                    >
                                        Find product
                                        <ArrowRight size={18} />
                                    </button>

                                </form>


                                {/* Lookup Info */}
                                <div className="mt-6 grid grid-cols-2 gap-3">

                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">

                                        <BadgeCheck
                                            size={23}
                                            className="text-teal-600"
                                        />

                                        <p className="mt-2 text-sm font-semibold leading-5 text-slate-700">
                                            8, 12 & 13 digit
                                            <br />
                                            barcodes
                                        </p>

                                    </div>


                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">

                                        <ShieldCheck
                                            size={23}
                                            className="text-teal-600"
                                        />

                                        <p className="mt-2 text-sm font-semibold leading-5 text-slate-700">
                                            Clear verification
                                            <br />
                                            status
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    HOW SCANIQ WORKS
                ====================================================== */}

                <section className="py-20">

                    <div className="mx-auto max-w-2xl text-center">

                        <p className="eyebrow text-teal-700">
                            How ScanIQ works
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            From a barcode to useful information
                        </h2>

                        <p className="mt-4 text-base leading-7 text-slate-600">
                            ScanIQ takes a product identifier and turns it into
                            information you can actually use.
                        </p>

                    </div>


                    {/* =================================================
                        DESKTOP — 4 CARDS IN ONE ROW
                    ================================================== */}

                    <div className="mt-12 hidden lg:grid lg:grid-cols-4">

                        {STEPS.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.number}
                                    className="relative px-4"
                                >

                                    {/* Arrow between cards */}
                                    {index < STEPS.length - 1 && (
                                        <ArrowRight
                                            size={20}
                                            className="absolute right-[-10px] top-7 text-teal-500"
                                        />
                                    )}

                                    <div className="soft-panel h-full p-5">

                                        <div className="flex items-center gap-3">

                                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
                                                {step.number}
                                            </span>

                                            <Icon
                                                size={25}
                                                className="text-teal-600"
                                            />

                                        </div>

                                        <h3 className="mt-5 text-lg font-bold text-slate-900">
                                            {step.title}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {step.description}
                                        </p>

                                    </div>

                                </div>
                            );
                        })}

                    </div>


                    {/* =================================================
                        MOBILE — 2 × 2 GRID
                    ================================================== */}

                    <div className="mt-10 grid grid-cols-2 gap-3 lg:hidden">

                        {STEPS.map((step) => {
                            const Icon = step.icon;

                            return (
                                <div
                                    key={step.number}
                                    className="soft-panel p-4 sm:p-5"
                                >

                                    {/* Number + Icon */}
                                    <div className="flex items-center gap-2">

                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
                                            {step.number}
                                        </span>

                                        <Icon
                                            size={21}
                                            className="text-teal-600"
                                        />

                                    </div>


                                    {/* Title */}
                                    <h3 className="mt-4 text-base font-bold text-slate-900 sm:text-lg">
                                        {step.title}
                                    </h3>


                                    {/* Description */}
                                    <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">
                                        {step.description}
                                    </p>

                                </div>
                            );
                        })}

                    </div>

                </section>


                {/* =====================================================
                    EXPLORE A PRODUCT
                ====================================================== */}

                <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-5 py-12 text-white sm:px-8 sm:py-14 lg:px-12">

                    <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">

                        {/* Left Content */}
                        <div>

                            <p className="eyebrow text-teal-400">
                                Explore a product
                            </p>

                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                More than just a barcode lookup.
                            </h2>

                            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                                Once ScanIQ identifies a product, you can
                                explore the information available about it
                                and use ScanIQ's tools to understand it better.
                            </p>

                            <Link
                                to="/search"
                                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                            >
                                Explore products
                                <ArrowRight size={17} />
                            </Link>

                        </div>


                        {/* Feature Grid */}
                        <div className="grid gap-3 sm:grid-cols-2">

                            {EXPLORE_FEATURES.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <div
                                        key={feature.title}
                                        className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:bg-white/[0.09]"
                                    >

                                        <div className="icon-tile">
                                            <Icon size={21} />
                                        </div>

                                        <h3 className="mt-4 font-bold">
                                            {feature.title}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-400">
                                            {feature.description}
                                        </p>

                                    </div>
                                );
                            })}

                        </div>

                    </div>

                </section>


                {/* =====================================================
                    FINAL CTA
                ====================================================== */}

                <section className="py-20">

                    <div className="surface overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-10">

                        <p className="eyebrow text-teal-700">
                            Ready to explore?
                        </p>

                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Understand your next product.
                        </h2>

                        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
                            ScanIQ helps you identify products, understand
                            their information, compare alternatives, and
                            review verification signals.
                        </p>


                        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

                            <Link
                                to="/search"
                                className="btn-primary justify-center"
                            >
                                <Search size={19} />
                                Explore products
                                <ArrowRight size={18} />
                            </Link>

                            <Link
                                to="/search"
                                className="btn-secondary justify-center"
                            >
                                Search catalog
                            </Link>

                        </div>

                    </div>

                </section>

            </div>
        </main>
    );
}

export default HomePage;
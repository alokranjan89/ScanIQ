import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Bot,
    CheckCircle2,
    ChevronDown,
    Heart,
    Loader2,
    ShieldCheck,
    XCircle,
} from "lucide-react";

import { getProductByBarcode } from "../api/products.api";

import {
    addFavorite,
    getFavorites,
    removeFavorite,
} from "../api/favorites.api";

import {
    verifyProduct,
} from "../api/verification.api";

import type {
    Product,
    ProductAttribute,
    ProductIngredient,
    ProductPrice,
    ProductSource,
} from "../types/api";

import type {
    VerificationCheck,
    VerificationResult,
} from "../api/verification.api";

const formatPrice = (price: ProductPrice) => {
    const amount =
        typeof price.amount === "string"
            ? Number(price.amount)
            : price.amount;

    if (!Number.isFinite(amount)) {
        return `${price.currency || "USD"} N/A`;
    }

    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: price.currency || "USD",
        }).format(amount);
    } catch {
        return `${price.currency || "USD"} ${amount}`;
    }
};

const formatLabel = (value: string) => {
    return value
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getGradeClasses = (
    grade: "A" | "B" | "C" | "D" | "E" | null,
) => {
    switch (grade) {
        case "A":
            return "bg-emerald-100 text-emerald-700 border-emerald-200";

        case "B":
            return "bg-green-100 text-green-700 border-green-200";

        case "C":
            return "bg-yellow-100 text-yellow-700 border-yellow-200";

        case "D":
            return "bg-orange-100 text-orange-700 border-orange-200";

        case "E":
            return "bg-red-100 text-red-700 border-red-200";

        default:
            return "bg-slate-200 text-slate-500 border-slate-300";
    }
};

const getWarningClasses = (
    severity: "info" | "warning" | "high",
) => {
    switch (severity) {
        case "high":
            return "border-red-200 bg-red-50";

        case "warning":
            return "border-orange-200 bg-orange-50";

        default:
            return "border-slate-200 bg-slate-50";
    }
};

const getVerificationCheckLabel = (
    value: VerificationCheck,
) => {
    switch (value) {
        case "MATCH":
            return "Match";

        case "MISMATCH":
            return "Mismatch";

        default:
            return "Unknown";
    }
};

const getVerificationCheckClasses = (
    value: VerificationCheck,
) => {
    switch (value) {
        case "MATCH":
            return "bg-emerald-50 text-emerald-700";

        case "MISMATCH":
            return "bg-red-50 text-red-700";

        default:
            return "bg-slate-100 text-slate-600";
    }
};

const getVerificationStatusClasses = (
    status: VerificationResult["status"],
) => {
    switch (status) {
        case "VERIFIED":
            return "border-emerald-200 bg-emerald-50 text-emerald-700";

        case "PARTIALLY_VERIFIED":
            return "border-yellow-200 bg-yellow-50 text-yellow-700";

        default:
            return "border-slate-200 bg-slate-50 text-slate-600";
    }
};

export default function ProductDetailsPage() {
    const { barcode } = useParams<{
        barcode: string;
    }>();

    const navigate = useNavigate();

    const [product, setProduct] =
        useState<Product | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [favorite, setFavorite] =
        useState(false);

    const [favoriteLoading, setFavoriteLoading] =
        useState(false);

    const [verification, setVerification] =
        useState<VerificationResult | null>(null);

    const [verificationLoading, setVerificationLoading] =
        useState(false);

    const [
        showVerificationDetails,
        setShowVerificationDetails,
    ] = useState(false);

    const nutrition =
        product?.nutrition ?? null;

    const nutritionGrade =
        product?.nutritionGrade ?? null;

    const officialNutriScore = useMemo(() => {
        const attribute =
            product?.attributes?.find(
                (item: ProductAttribute) =>
                    item.key.toLowerCase() ===
                    "nutri_score",
            );

        return attribute?.value ?? null;
    }, [product?.attributes]);

    useEffect(() => {
        if (!barcode) {
            setError("Product barcode is missing.");
            setLoading(false);
            return;
        }

        let cancelled = false;

        const loadProduct = async () => {
            setLoading(true);
            setError(null);

            try {
                const result =
                    await getProductByBarcode(
                        barcode,
                    );

                if (cancelled) {
                    return;
                }

                setProduct(result);

                try {
                    const favorites =
                        await getFavorites();

                    if (cancelled) {
                        return;
                    }

                    setFavorite(
                        favorites.some(
                            (item) =>
                                item.productId ===
                                result.id,
                        ),
                    );
                } catch {
                    if (!cancelled) {
                        setFavorite(false);
                    }
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load product.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadProduct();

        return () => {
            cancelled = true;
        };
    }, [barcode]);

    const handleFavorite = async () => {
        if (!product || favoriteLoading) {
            return;
        }

        setFavoriteLoading(true);

        try {
            if (favorite) {
                await removeFavorite(
                    product.id,
                );

                setFavorite(false);
            } else {
                await addFavorite(
                    product.id,
                );

                setFavorite(true);
            }
        } catch (err) {
            console.error(
                "Favorite update failed:",
                err,
            );
        } finally {
            setFavoriteLoading(false);
        }
    };

    const handleVerify = async () => {
        if (
            !product ||
            verificationLoading
        ) {
            return;
        }

        setVerificationLoading(true);

        try {
            const result =
                await verifyProduct(
                    product.id,
                );

            setVerification(result);

            setShowVerificationDetails(
                true,
            );
        } catch (err) {
            console.error(
                "Verification failed:",
                err,
            );
        } finally {
            setVerificationLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4">
                    <div className="flex items-center gap-3 text-slate-600">
                        <Loader2 className="h-5 w-5 animate-spin" />

                        <span>
                            Loading product...
                        </span>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                        <XCircle className="mx-auto h-10 w-10 text-red-500" />

                        <h1 className="mt-4 text-xl font-semibold text-slate-900">
                            Product not found
                        </h1>

                        <p className="mt-2 text-sm text-slate-600">
                            {error ||
                                "We could not find information for this product."}
                        </p>

                        <Link
                            to="/"
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            <ArrowLeft className="h-4 w-4" />

                            Back to ScanIQ
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Back */}
                <button
                    type="button"
                    onClick={() =>
                        navigate(-1)
                    }
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
                >
                    <ArrowLeft className="h-4 w-4" />

                    Back
                </button>

                {/* Product Header */}
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[320px_1fr]">
                        {/* Image */}
                        <div className="flex min-h-[280px] items-center justify-center rounded-2xl bg-slate-50 p-5">
                            {product.imageUrl ? (
                                <img
                                    src={
                                        product.imageUrl
                                    }
                                    alt={
                                        product.name
                                    }
                                    className="max-h-[300px] w-full object-contain"
                                />
                            ) : (
                                <div className="text-sm text-slate-400">
                                    No product image
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="flex flex-col">
                            {product.brand && (
                                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                                    {
                                        product.brand
                                    }
                                </p>
                            )}

                            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                {
                                    product.name
                                }
                            </h1>

                            {product.category && (
                                <p className="mt-3 text-sm leading-6 text-slate-500">
                                    {
                                        product.category
                                    }
                                </p>
                            )}

                            {product.description && (
                                <p className="mt-4 text-sm leading-6 text-slate-600">
                                    {
                                        product.description
                                    }
                                </p>
                            )}

                            <div className="mt-6 flex flex-wrap gap-2">
                                {/* Favorite */}
                                <button
                                    type="button"
                                    onClick={
                                        handleFavorite
                                    }
                                    disabled={
                                        favoriteLoading
                                    }
                                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                                        favorite
                                            ? "border-red-200 bg-red-50 text-red-600"
                                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    {favoriteLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Heart
                                            className="h-4 w-4"
                                            fill={
                                                favorite
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                        />
                                    )}

                                    {favorite
                                        ? "Remove Favorite"
                                        : "Add Favorite"}
                                </button>

                                {/* Compare */}
                                <Link
                                    to={`/compare?product=${product.id}`}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Compare
                                </Link>

                                {/* Ask AI */}
                                <Link
                                    to={`/ask-ai?product=${product.id}`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                                >
                                    <Bot className="h-4 w-4" />

                                    Ask AI
                                </Link>

                                {/* Verify */}
                                <button
                                    type="button"
                                    onClick={
                                        handleVerify
                                    }
                                    disabled={
                                        verificationLoading
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                                >
                                    {verificationLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ShieldCheck className="h-4 w-4" />
                                    )}

                                    Verify Product
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Verification */}
                {verification && (
                    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <button
                            type="button"
                            onClick={() =>
                                setShowVerificationDetails(
                                    (current) =>
                                        !current,
                                )
                            }
                            className="flex w-full items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-3">
                                {verification.verified ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                ) : (
                                    <XCircle className="h-6 w-6 text-orange-500" />
                                )}

                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-semibold text-slate-900">
                                            Product Verification
                                        </h2>

                                        <span
                                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getVerificationStatusClasses(
                                                verification.status,
                                            )}`}
                                        >
                                            {formatLabel(
                                                verification.status,
                                            )}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {
                                            verification.message
                                        }
                                    </p>
                                </div>
                            </div>

                            <ChevronDown
                                className={`h-5 w-5 shrink-0 text-slate-400 transition ${
                                    showVerificationDetails
                                        ? "rotate-180"
                                        : ""
                                }`}
                            />
                        </button>

                        {showVerificationDetails && (
                            <div className="mt-5 border-t border-slate-200 pt-5">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {Object.entries(
                                        verification.checks,
                                    ).map(
                                        ([
                                            key,
                                            value,
                                        ]) => (
                                            <div
                                                key={key}
                                                className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                                            >
                                                <span className="text-sm text-slate-600">
                                                    {formatLabel(
                                                        key,
                                                    )}
                                                </span>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getVerificationCheckClasses(
                                                        value,
                                                    )}`}
                                                >
                                                    {getVerificationCheckLabel(
                                                        value,
                                                    )}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>

                                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                                    <p className="text-sm text-slate-600">
                                        Sources checked:{" "}
                                        <span className="font-semibold text-slate-900">
                                            {
                                                verification.sourceCount
                                            }
                                        </span>
                                    </p>
                                </div>

                                {verification
                                    .sources.length >
                                    0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-semibold text-slate-900">
                                            Verification
                                            sources
                                        </p>

                                        <div className="mt-3 space-y-2">
                                            {verification.sources.map(
                                                (
                                                    source,
                                                ) => (
                                                    <div
                                                        key={`${source.provider}-${source.sourceUrl ?? ""}`}
                                                        className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-slate-900">
                                                                {
                                                                    source.provider
                                                                }
                                                            </span>

                                                            {source.isPrimary && (
                                                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                                                    Primary
                                                                </span>
                                                            )}
                                                        </div>

                                                        {source.sourceUrl && (
                                                            <a
                                                                href={
                                                                    source.sourceUrl
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-sm font-medium text-slate-700 underline underline-offset-4 hover:text-slate-900"
                                                            >
                                                                View
                                                                source
                                                            </a>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                <p className="mt-4 text-xs leading-5 text-slate-500">
                                    Unable to verify does
                                    not mean the product is
                                    counterfeit. Verification
                                    depends on the information
                                    available to ScanIQ.
                                </p>
                            </div>
                        )}
                    </section>
                )}

                {/* Product Information */}
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <h2 className="text-xl font-semibold text-slate-900">
                        Product Information
                    </h2>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Barcode
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                                {
                                    product.barcode
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Brand
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                                {product.brand ||
                                    "N/A"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Category
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                                {product.category ||
                                    "N/A"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Manufacturer
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                                {product.manufacturer ||
                                    "N/A"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Country
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                                {product.country ||
                                    "N/A"}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Model Number
                            </p>

                            <p className="mt-1 font-medium text-slate-900">
                                {product.modelNumber ||
                                    "N/A"}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Nutrition */}
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Nutrition
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Values shown{" "}
                            {nutrition?.unit ===
                            "per_100ml"
                                ? "per 100 ml"
                                : "per 100 g"}
                        </p>
                    </div>

                    {/* ScanIQ Nutrition Grade */}
                    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    ScanIQ Nutrition Grade
                                </p>

                                {nutritionGrade?.calculated &&
                                nutritionGrade.grade ? (
                                    <div className="mt-3 flex items-center gap-3">
                                        <div
                                            className={`flex h-14 w-14 items-center justify-center rounded-xl border text-2xl font-bold ${getGradeClasses(
                                                nutritionGrade.grade,
                                            )}`}
                                        >
                                            {
                                                nutritionGrade.grade
                                            }
                                        </div>

                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                Grade{" "}
                                                {
                                                    nutritionGrade.grade
                                                }
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                ScanIQ calculated
                                                score:{" "}
                                                {
                                                    nutritionGrade.score
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 text-sm font-bold text-slate-500">
                                            N/A
                                        </div>

                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                Not enough data
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                ScanIQ cannot calculate
                                                a grade yet.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Data completeness */}
                            <div className="w-full lg:max-w-xs">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-slate-600">
                                        Data completeness
                                    </span>

                                    <span className="font-semibold text-slate-900">
                                        {nutritionGrade
                                            ?.dataCompleteness
                                            .percentage ??
                                            0}
                                        %
                                    </span>
                                </div>

                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                        className="h-full rounded-full bg-slate-900 transition-all"
                                        style={{
                                            width: `${
                                                nutritionGrade
                                                    ?.dataCompleteness
                                                    .percentage ??
                                                0
                                            }%`,
                                        }}
                                    />
                                </div>

                                <p className="mt-2 text-xs text-slate-500">
                                    {nutritionGrade
                                        ?.dataCompleteness
                                        .available ??
                                        0}{" "}
                                    of{" "}
                                    {nutritionGrade
                                        ?.dataCompleteness
                                        .required ??
                                        0}{" "}
                                    required values
                                    available
                                </p>
                            </div>
                        </div>

                        {/* Why grade */}
                        <div className="mt-5 border-t border-slate-200 pt-4">
                            <details>
                                <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                                    Why can't ScanIQ grade this
                                    product?
                                </summary>

                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    {nutritionGrade?.explanation ??
                                        "There is not enough nutrition data to calculate a ScanIQ Nutrition Grade."}
                                </p>
                            </details>
                        </div>

                        {/* Official Nutri-Score */}
                        {officialNutriScore && (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            Official Nutri-Score
                                        </p>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Provided by the product
                                            data source
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 font-bold text-green-700">
                                        {
                                            officialNutriScore
                                        }
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="mt-4 text-xs leading-5 text-slate-500">
                            ScanIQ Nutrition Grade is an
                            informational assessment based on
                            available nutrition data. It is not a
                            medical assessment and is not the
                            official Nutri-Score.
                        </p>
                    </div>

                    {/* Nutrition warnings */}
                    {nutritionGrade?.warnings &&
                        nutritionGrade.warnings.length >
                            0 && (
                            <div className="mb-6">
                                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                                    Nutrition warnings
                                </h3>

                                <div className="space-y-2">
                                    {nutritionGrade.warnings.map(
                                        (warning) => (
                                            <div
                                                key={
                                                    warning.code
                                                }
                                                className={`rounded-xl border p-4 ${getWarningClasses(
                                                    warning.severity,
                                                )}`}
                                            >
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {
                                                        warning.title
                                                    }
                                                </p>

                                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                                    {
                                                        warning.message
                                                    }
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}

                    {/* Nutrition Values */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                            [
                                "Calories",
                                nutrition?.calories,
                            ],
                            [
                                "Protein",
                                nutrition?.protein,
                            ],
                            [
                                "Carbohydrates",
                                nutrition?.carbohydrates,
                            ],
                            [
                                "Fat",
                                nutrition?.fat,
                            ],
                            [
                                "Saturated Fat",
                                nutrition?.saturatedFat,
                            ],
                            [
                                "Sugars",
                                nutrition?.sugars,
                            ],
                            [
                                "Fiber",
                                nutrition?.fiber,
                            ],
                            [
                                "Sodium",
                                nutrition?.sodium,
                            ],
                        ].map(
                            ([label, value]) => (
                                <div
                                    key={String(
                                        label,
                                    )}
                                    className="rounded-xl border border-slate-200 bg-white p-4"
                                >
                                    <p className="text-xs font-medium text-slate-500">
                                        {label}
                                    </p>

                                    <p className="mt-2 text-lg font-semibold text-slate-900">
                                        {value !==
                                            null &&
                                        value !==
                                            undefined
                                            ? String(
                                                  value,
                                              )
                                            : "N/A"}
                                    </p>
                                </div>
                            ),
                        )}
                    </div>
                </section>

                {/* Ingredients */}
                {product.ingredients &&
                    product.ingredients.length >
                        0 && (
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-xl font-semibold text-slate-900">
                                Ingredients
                            </h2>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {product.ingredients.map(
                                    (
                                        ingredient: ProductIngredient,
                                    ) => (
                                        <span
                                            key={`${ingredient.name}-${ingredient.description ?? ""}`}
                                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                        >
                                            {
                                                ingredient.name
                                            }
                                        </span>
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                {/* Specifications */}
                {product.attributes &&
                    product.attributes.length >
                        0 && (
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-xl font-semibold text-slate-900">
                                Specifications
                            </h2>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {product.attributes.map(
                                    (
                                        attribute: ProductAttribute,
                                    ) => (
                                        <div
                                            key={`${attribute.key}-${attribute.value}`}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                {formatLabel(
                                                    attribute.key,
                                                )}
                                            </p>

                                            <p className="mt-2 text-sm font-medium text-slate-900">
                                                {attribute.value ||
                                                    "N/A"}
                                            </p>
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                {/* Prices */}
                {product.prices &&
                    product.prices.length >
                        0 && (
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-xl font-semibold text-slate-900">
                                Prices
                            </h2>

                            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {product.prices.map(
                                    (
                                        price: ProductPrice,
                                        index,
                                    ) => (
                                        <div
                                            key={`${price.merchant}-${price.priceType}-${index}`}
                                            className="rounded-xl border border-slate-200 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        {
                                                            price.priceType
                                                        }
                                                    </p>

                                                    <p className="mt-2 font-medium text-slate-900">
                                                        {price.merchant ||
                                                            price.source ||
                                                            "Unknown merchant"}
                                                    </p>
                                                </div>

                                                <p className="font-semibold text-slate-900">
                                                    {formatPrice(
                                                        price,
                                                    )}
                                                </p>
                                            </div>

                                            {price.availability && (
                                                <p className="mt-3 text-xs text-slate-500">
                                                    {
                                                        price.availability
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                {/* Data Sources */}
                {product.sources &&
                    product.sources.length >
                        0 && (
                        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-xl font-semibold text-slate-900">
                                Data Sources
                            </h2>

                            <div className="mt-5 space-y-3">
                                {product.sources.map(
                                    (
                                        source: ProductSource,
                                    ) => (
                                        <div
                                            key={`${source.provider}-${source.sourceUrl ?? ""}`}
                                            className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-medium text-slate-900">
                                                        {
                                                            source.provider
                                                        }
                                                    </p>

                                                    {source.isPrimary && (
                                                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                                            Primary
                                                            source
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {source.sourceUrl && (
                                                <a
                                                    href={
                                                        source.sourceUrl
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-sm font-medium text-slate-700 underline underline-offset-4 hover:text-slate-900"
                                                >
                                                    View source
                                                </a>
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>
                    )}
            </div>
        </main>
    );
}
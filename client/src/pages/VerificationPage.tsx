import { useEffect, useState } from "react";
import {
    Link,
    useParams,
} from "react-router-dom";

import {
    verifyProduct,
} from "../api/verification.api";
import {
    getProductById,
} from "../api/products.api";

import type {
    VerificationCheck,
    VerificationResult,
} from "../api/verification.api";
import { getSafeUrl } from "../utils/url";


function VerificationPage() {
    const { productId } = useParams<{
        productId: string;
    }>();

    const [verification, setVerification] =
        useState<VerificationResult | null>(null);

    const [productBarcode, setProductBarcode] =
        useState<string | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        const loadVerification = async () => {
            const id = Number(productId);

            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {
                setError(
                    "Invalid product ID.",
                );
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const [
                    result,
                    product,
                ] = await Promise.all([
                    verifyProduct(id),
                    getProductById(id),
                ]);

                setVerification(result);
                setProductBarcode(
                    product.barcode,
                );
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to verify this product.",
                );
            } finally {
                setIsLoading(false);
            }
        };

        void loadVerification();
    }, [productId]);

    if (isLoading) {
        return (
            <main className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-4">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                    <p className="text-sm text-gray-600">
                        Verifying product information...
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="mx-auto max-w-4xl px-4 py-10">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <h1 className="text-lg font-semibold text-red-800">
                        Verification failed
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

    if (!verification) {
        return null;
    }

    return (
        <main className="page-shell">
            <div className="mx-auto max-w-4xl">
            <Link
                to={
                    productBarcode
                        ? `/products/${productBarcode}`
                        : "/"
                }
                className="text-sm font-semibold text-slate-500 hover:text-slate-950"
            >
                Back to product
            </Link>

            <div className="mt-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Product Verification
                </h1>

                <p className="mt-2 text-slate-600">
                    Verification is based on available
                    product sources and their agreement.
                </p>
            </div>

            <VerificationStatusCard
                status={verification.status}
                message={verification.message}
                sourceCount={verification.sourceCount}
            />

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                    Verification Checks
                </h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <CheckCard
                        label="Barcode"
                        value={
                            verification.checks
                                .barcodeMatch
                        }
                    />

                    <CheckCard
                        label="Product Name"
                        value={
                            verification.checks
                                .nameAgreement
                        }
                    />

                    <CheckCard
                        label="Brand"
                        value={
                            verification.checks
                                .brandAgreement
                        }
                    />

                    <CheckCard
                        label="Category"
                        value={
                            verification.checks
                                .categoryAgreement
                        }
                    />

                    <CheckCard
                        label="Manufacturer"
                        value={
                            verification.checks
                                .manufacturerAgreement
                        }
                    />

                    <CheckCard
                        label="Country"
                        value={
                            verification.checks
                                .countryAgreement
                        }
                    />

                    <CheckCard
                        label="Model Number"
                        value={
                            verification.checks
                                .modelNumberAgreement
                        }
                    />
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900">
                    Sources
                </h2>

                {verification.sources.length ===
                0 ? (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                        <p className="text-sm text-gray-600">
                            No external product sources
                            are available.
                        </p>
                    </div>
                ) : (
                    <div className="mt-4 space-y-3">
                        {verification.sources.map(
                            (source) => (
                                <div
                                    key={`${source.provider}-${source.sourceUrl}`}
                                    className="rounded-xl border border-gray-200 bg-white p-5"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {
                                                    source.provider
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {source.isPrimary
                                                    ? "Primary source"
                                                    : "External source"}
                                            </p>
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
            </div>

            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h2 className="font-semibold text-gray-900">
                    Important
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                    Verification indicates whether
                    available product information agrees
                    across sources. An unable-to-verify
                    result does not mean that a product is
                    counterfeit.
                </p>
            </div>
            </div>
        </main>
    );
}

type VerificationStatusCardProps = {
    status: VerificationResult["status"];
    message: string;
    sourceCount: number;
};

function VerificationStatusCard({
    status,
    message,
    sourceCount,
}: VerificationStatusCardProps) {
    const config = getStatusConfig(status);

    return (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">
                        Verification Status
                    </p>

                    <h2
                        className={`mt-1 text-2xl font-bold ${config.textClass}`}
                    >
                        {config.label}
                    </h2>
                </div>

                <div className="rounded-xl bg-gray-50 px-4 py-3 text-center">
                    <p className="text-xs text-gray-500">
                        Sources
                    </p>

                    <p className="mt-1 text-lg font-semibold text-gray-900">
                        {sourceCount}
                    </p>
                </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-gray-600">
                {message}
            </p>
        </div>
    );
}

function getStatusConfig(
    status: VerificationResult["status"],
) {
    switch (status) {
        case "VERIFIED":
            return {
                label: "Verified",
                textClass: "text-green-700",
            };

        case "PARTIALLY_VERIFIED":
            return {
                label: "Partially Verified",
                textClass: "text-yellow-700",
            };

        case "UNABLE_TO_VERIFY":
            return {
                label: "Unable to Verify",
                textClass: "text-gray-700",
            };
    }
}

type CheckCardProps = {
    label: string;
    value: VerificationCheck;
};

function CheckCard({
    label,
    value,
}: CheckCardProps) {
    const config = getCheckConfig(value);

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
                <p className="font-medium text-gray-900">
                    {label}
                </p>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${config.badgeClass}`}
                >
                    {config.label}
                </span>
            </div>
        </div>
    );
}

function getCheckConfig(
    value: VerificationCheck,
) {
    switch (value) {
        case "MATCH":
            return {
                label: "Match",
                badgeClass:
                    "bg-green-100 text-green-700",
            };

        case "MISMATCH":
            return {
                label: "Mismatch",
                badgeClass:
                    "bg-red-100 text-red-700",
            };

        case "UNKNOWN":
            return {
                label: "Unknown",
                badgeClass:
                    "bg-gray-100 text-gray-600",
            };
    }
}

export default VerificationPage;


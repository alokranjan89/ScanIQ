import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { explainProduct } from "../api/ai.api";
import { getProductByBarcode } from "../api/products.api";

import type { Product } from "../types/api";

function AIPage() {
    const { barcode } = useParams<{
        barcode: string;
    }>();

    const navigate = useNavigate();

    const [product, setProduct] =
        useState<Product | null>(null);

    const [question, setQuestion] =
        useState("");

    const [answer, setAnswer] =
        useState<string | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isAsking, setIsAsking] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        if (!barcode) {
            setError(
                "No barcode was provided.",
            );

            setIsLoading(false);

            return;
        }

        let cancelled = false;

        const loadProduct = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const result =
                    await getProductByBarcode(
                        barcode,
                    );

                if (!cancelled) {
                    setProduct(result);
                }
            } catch (err) {
                if (cancelled) {
                    return;
                }

                const message =
                    err instanceof Error
                        ? err.message
                        : "Unable to load product.";

                setError(message);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void loadProduct();

        return () => {
            cancelled = true;
        };
    }, [barcode]);

    const handleAskAI = async () => {
        if (!product) {
            return;
        }

        const trimmedQuestion =
            question.trim();

        if (!trimmedQuestion) {
            setError(
                "Please enter a question.",
            );

            return;
        }

        try {
            setIsAsking(true);
            setError(null);
            setAnswer(null);

            const result =
                await explainProduct(
                    product.id,
                    trimmedQuestion,
                );

            setAnswer(
                result.explanation,
            );
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Unable to generate an AI explanation.";

            setError(message);
        } finally {
            setIsAsking(false);
        }
    };

    if (isLoading) {
        return (
            <main className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />

                    <p className="font-medium text-slate-600">
                        Loading product...
                    </p>
                </div>
            </main>
        );
    }

    if (error && !product) {
        return (
            <main className="page-shell flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
                <div className="surface w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-lg">
                    <div className="mb-4 text-4xl">
                        ⚠️
                    </div>

                    <h1 className="mb-2 text-xl font-bold text-slate-950">
                        Unable to load product
                    </h1>

                    <p className="mb-6 text-sm text-slate-600">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="btn-secondary"
                    >
                        Go Back
                    </button>
                </div>
            </main>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <main className="page-shell">
            <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">

                {/* Header */}
                <header className="mb-6 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="btn-secondary py-2 text-sm"
                    >
                        ← Back
                    </button>

                    <div className="text-right">
                        <p className="eyebrow">
                            ScanIQ
                        </p>

                        <p className="text-sm font-medium text-slate-500">
                            AI Product Assistant
                        </p>
                    </div>
                </header>

                {/* Product summary */}
                <section className="surface mb-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                            {product.imageUrl ? (
                                <img
                                    src={
                                        product.imageUrl
                                    }
                                    alt={
                                        product.name
                                    }
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <span className="text-4xl">
                                    📦
                                </span>
                            )}
                        </div>

                        <div className="min-w-0">
                            <span className="mb-1 inline-block rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-700">
                                {product.category ??
                                    "Product"}
                            </span>

                            <h1 className="mt-1 text-2xl font-extrabold text-slate-950">
                                {product.name}
                            </h1>

                            {product.brand && (
                                <p className="mt-1 text-sm font-medium text-slate-600">
                                    {product.brand}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* AI section */}
                <section className="surface mb-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="icon-tile">
                                ✨
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-950">
                                    Ask AI
                                </h2>

                                <p className="text-sm text-slate-600">
                                    Ask a question about
                                    this product using
                                    the available product
                                    information.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Question */}
                    <label
                        htmlFor="ai-question"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        What would you like to know?
                    </label>

                    <textarea
                        id="ai-question"
                        value={question}
                        onChange={(event) =>
                            setQuestion(
                                event.target.value,
                            )
                        }
                        placeholder="Ask about the product, ingredients, nutrition, or specifications..."
                        rows={4}
                        maxLength={500}
                        disabled={isAsking}
                        className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                    />

                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Ask questions using the
                            available product data.
                        </p>

                        <p className="text-xs font-medium text-slate-400">
                            {question.length}/500
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            void handleAskAI()
                        }
                        disabled={
                            isAsking ||
                            !question.trim()
                        }
                        className="btn-primary mt-4 w-full"
                    >
                        {isAsking
                            ? "Thinking..."
                            : "Ask AI"}
                    </button>
                </section>

                {/* Error */}
                {error && product && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-700">
                            {error}
                        </p>
                    </div>
                )}

                {/* Answer */}
                {answer && (
                    <section className="surface rounded-3xl border border-teal-200/80 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="icon-tile">
                                🤖
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-950">
                                    AI Answer
                                </h2>

                                <p className="text-sm text-slate-600">
                                    Based on available
                                    product information
                                </p>
                            </div>
                        </div>

                        <div className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                Your question
                            </p>

                            <p className="mt-2 text-sm font-medium text-slate-800">
                                {question}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-teal-100/70 bg-teal-50/40 p-5">
                            <p className="whitespace-pre-wrap leading-7 text-slate-800">
                                {answer}
                            </p>
                        </div>

                        <p className="mt-4 text-xs leading-5 text-slate-500">
                            AI-generated information may
                            be incomplete. Check the
                            original product information
                            and sources when making
                            important decisions.
                        </p>
                    </section>
                )}
            </div>
        </main>
    );
}

export default AIPage;
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
            <main className="min-h-screen bg-slate-950 text-white">
                <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-white" />

                        <p className="text-slate-300">
                            Loading product...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (error && !product) {
        return (
            <main className="min-h-screen bg-slate-950 text-white">
                <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6">
                    <div className="w-full max-w-md rounded-2xl border border-red-900/50 bg-slate-900 p-8 text-center">
                        <div className="mb-4 text-4xl">
                            ⚠️
                        </div>

                        <h1 className="mb-2 text-xl font-semibold">
                            Unable to load product
                        </h1>

                        <p className="mb-6 text-sm text-slate-400">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(-1)
                            }
                            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Header */}
                <header className="mb-8 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                    >
                        ← Back
                    </button>

                    <div className="text-right">
                        <p className="text-xs uppercase tracking-widest text-slate-500">
                            ScanIQ
                        </p>

                        <p className="text-sm text-slate-400">
                            AI Product Assistant
                        </p>
                    </div>
                </header>

                {/* Product summary */}
                <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
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
                            <p className="mb-1 text-sm font-medium uppercase tracking-wider text-emerald-400">
                                {product.category ??
                                    "Product"}
                            </p>

                            <h1 className="text-2xl font-bold">
                                {product.name}
                            </h1>

                            {product.brand && (
                                <p className="mt-1 text-slate-400">
                                    {product.brand}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* AI section */}
                <section className="mb-6 rounded-3xl border border-slate-800 bg-slate-900 p-6">
                    <div className="mb-6">
                        <div className="mb-3 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                                ✨
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">
                                    Ask AI
                                </h2>

                                <p className="text-sm text-slate-400">
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
                        className="mb-2 block text-sm font-medium text-slate-300"
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
                        className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Ask questions using the
                            available product data.
                        </p>

                        <p className="text-xs text-slate-600">
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
                        className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isAsking
                            ? "Thinking..."
                            : "Ask AI"}
                    </button>
                </section>

                {/* Error */}
                {error && product && (
                    <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 p-4">
                        <p className="text-sm text-red-300">
                            {error}
                        </p>
                    </div>
                )}

                {/* Answer */}
                {answer && (
                    <section className="rounded-3xl border border-blue-900/50 bg-slate-900 p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                                🤖
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold">
                                    AI Answer
                                </h2>

                                <p className="text-sm text-slate-400">
                                    Based on available
                                    product information
                                </p>
                            </div>
                        </div>

                        <div className="mb-4 rounded-2xl bg-slate-800/60 p-5">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Your question
                            </p>

                            <p className="mt-2 text-sm text-slate-300">
                                {question}
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-800/60 p-5">
                            <p className="whitespace-pre-wrap leading-7 text-slate-200">
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
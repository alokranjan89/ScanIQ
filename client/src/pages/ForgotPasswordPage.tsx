import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../api/auth.api";
import { ApiError } from "../api/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await requestPasswordReset(email.trim());
            setSent(true);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Unable to request a reset link. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="page-shell flex min-h-screen items-center justify-center px-4">
            <section className="surface w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                <h1 className="text-2xl font-bold text-slate-950">Forgot password?</h1>
                <p className="mt-2 text-sm text-slate-600">Enter your account email and we’ll send a reset link if an account exists.</p>
                {sent ? (
                    <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
                        If an account exists for that email, a reset link has been sent. The link expires in 30 minutes.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <label className="block text-sm font-medium text-slate-700" htmlFor="reset-email">Email</label>
                        <input id="reset-email" type="email" required maxLength={254} autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                        <button disabled={isLoading} className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white disabled:opacity-60">
                            {isLoading ? "Sending…" : "Send reset link"}
                        </button>
                    </form>
                )}
                <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-teal-700 hover:underline">Back to sign in</Link>
            </section>
        </main>
    );
}

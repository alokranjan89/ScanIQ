import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth.api";
import { ApiError } from "../api/client";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(token, password);
            setIsDone(true);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Unable to reset your password. Please request a new link.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="page-shell flex min-h-screen items-center justify-center px-4">
            <section className="surface w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
                <h1 className="text-2xl font-bold text-slate-950">Reset your password</h1>
                {isDone ? (
                    <div className="mt-5 space-y-4">
                        <p role="status" className="text-sm text-emerald-800">Your password has been updated. You can sign in now.</p>
                        <Link to="/login" className="inline-block font-semibold text-teal-700 hover:underline">Go to sign in</Link>
                    </div>
                ) : !token ? (
                    <p role="alert" className="mt-5 text-sm text-red-700">This reset link is missing its token. Request a new link to continue.</p>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <label className="block text-sm font-medium text-slate-700" htmlFor="new-password">New password</label>
                        <input id="new-password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                        <label className="block text-sm font-medium text-slate-700" htmlFor="confirm-password">Confirm new password</label>
                        <input id="confirm-password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                        <button disabled={isLoading} className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white disabled:opacity-60">
                            {isLoading ? "Updating…" : "Update password"}
                        </button>
                    </form>
                )}
                <Link to="/forgot-password" className="mt-6 inline-block text-sm font-semibold text-teal-700 hover:underline">Request another reset link</Link>
            </section>
        </main>
    );
}

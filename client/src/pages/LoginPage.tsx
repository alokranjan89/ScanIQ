import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Eye,
    EyeOff,
    Loader2,
    ScanLine,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

function LoginPage() {
    const navigate = useNavigate();

    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [isLoading, setIsLoading] =
        useState(false);

    const [error, setError] = useState("");

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        setError("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Please enter your email.");
            return;
        }

        if (!password) {
            setError("Please enter your password.");
            return;
        }

        setIsLoading(true);

        try {
            await login({
                email: trimmedEmail,
                password,
            });

            navigate("/");
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError(
                    "Unable to sign in. Please try again.",
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
                <div className="w-full">

                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <Link
                            to="/"
                            className="mb-6 inline-flex items-center gap-2"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500 text-slate-950">
                                <ScanLine size={24} />
                            </span>

                            <span className="text-2xl font-bold tracking-tight">
                                ScanIQ
                            </span>
                        </Link>

                        <h1 className="mt-6 text-3xl font-bold">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            Sign in to continue to ScanIQ
                        </p>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8">
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-slate-200"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    disabled={isLoading}
                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-slate-200"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        disabled={isLoading}
                                        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (current) =>
                                                    !current,
                                            )
                                        }
                                        disabled={isLoading}
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-white disabled:cursor-not-allowed"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div
                                    role="alert"
                                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                                >
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2
                                            size={19}
                                            className="animate-spin"
                                        />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>

                        {/* Register */}
                        <div className="my-6 flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-800" />

                            <span className="text-xs text-slate-500">
                                OR
                            </span>

                            <div className="h-px flex-1 bg-slate-800" />
                        </div>

                        <p className="text-center text-sm text-slate-400">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="font-semibold text-cyan-400 hover:text-cyan-300"
                            >
                                Create account
                            </Link>
                        </p>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-500">
                        Sign in to access your ScanIQ
                        history and favorites.
                    </p>
                </div>
            </div>
        </main>
    );
}

export default LoginPage;
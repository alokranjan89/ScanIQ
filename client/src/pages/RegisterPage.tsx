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

function RegisterPage() {
    const navigate = useNavigate();

    const { register } = useAuth();

    const [name, setName] = useState("");
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

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName) {
            setError("Please enter your name.");
            return;
        }

        if (!trimmedEmail) {
            setError("Please enter your email.");
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters.",
            );
            return;
        }

        setIsLoading(true);

        try {
            await register({
                name: trimmedName,
                email: trimmedEmail,
                password,
            });

            navigate("/");
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError(
                    "Unable to create your account. Please try again.",
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="page-shell flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="mb-8 text-center">
                    <Link
                        to="/"
                        className="mb-4 inline-flex items-center gap-2"
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 text-white shadow-lg shadow-teal-700/20">
                            <ScanLine size={24} />
                        </span>

                        <span className="text-2xl font-bold tracking-tight text-slate-950">
                            ScanIQ
                        </span>
                    </Link>

                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">
                        Create your account
                    </h1>

                    <p className="mt-2 text-sm text-slate-600">
                        Scan. Verify. Understand.
                    </p>
                </div>

                {/* Card */}
                <div className="surface rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-xl backdrop-blur-md sm:p-8">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Full name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(event) =>
                                    setName(
                                        event.target.value,
                                    )
                                }
                                placeholder="Enter your name"
                                autoComplete="name"
                                disabled={isLoading}
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-semibold text-slate-700"
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
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-semibold text-slate-700"
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
                                    placeholder="At least 8 characters"
                                    autoComplete="new-password"
                                    disabled={isLoading}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60"
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
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                                >
                                    {showPassword ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>
                            </div>

                            <p className="mt-2 text-xs text-slate-500">
                                Use at least 8 characters.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3.5 font-bold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800 hover:shadow-teal-800/25 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2
                                        size={19}
                                        className="animate-spin"
                                    />
                                    Creating account...
                                </>
                            ) : (
                                "Create account"
                            )}
                        </button>
                    </form>

                    {/* Login link */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />

                        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                            OR
                        </span>

                        <div className="h-px flex-1 bg-slate-200" />
                    </div>

                    <p className="text-center text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-teal-700 underline-offset-2 hover:text-teal-800 hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Your account lets ScanIQ save your scan history and favorites.
                </p>
            </div>
        </main>
    );
}

export default RegisterPage;
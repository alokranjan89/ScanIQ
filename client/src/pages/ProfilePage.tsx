import {
    ChevronRight,
    LogOut,
    Moon,
    Settings,
    Shield,
} from "lucide-react";

import { useState } from "react";

import { useAuth } from "../context/AuthContext";

function ProfilePage() {
    const {
        user,
        isLoading,
        logout,
    } = useAuth();

    const [saveHistory, setSaveHistory] =
        useState(true);

    const [aiExplanations, setAiExplanations] =
        useState(true);

    const [reduceMotion, setReduceMotion] =
        useState(false);

    const [currency, setCurrency] =
        useState("USD");

    if (isLoading) {
        return (
            <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10">
                <div className="mx-auto max-w-3xl animate-pulse">
                    <div className="h-7 w-48 rounded bg-slate-200" />

                    <div className="mt-7 h-24 rounded-xl bg-white" />

                    <div className="mt-7 h-40 rounded-xl bg-white" />
                </div>
            </main>
        );
    }

    if (!user) {
        return null;
    }

    const initials =
        user.name
            ?.split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";

    const handleLogout = async () => {
        await logout();
    };

    return (
        <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8 sm:px-6">
            <div className="mx-auto max-w-3xl">

                {/* PAGE TITLE */}
                <div className="mb-7">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                        Profile & Settings
                    </h1>

                    <p className="mt-1.5 text-sm text-slate-500">
                        Manage your account and preferences.
                    </p>
                </div>

                {/* PROFILE */}
                <section className="border-b border-slate-200 pb-6">
                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3.5">

                            {/* Avatar */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                                {initials}
                            </div>

                            {/* Name + email */}
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    {user.name}
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        {/* Edit profile */}
                        <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Edit profile
                        </button>
                    </div>
                </section>

                {/* ACCOUNT */}
                <section className="border-b border-slate-200 py-7">

                    <h2 className="mb-3 text-xs font-semibold text-slate-900">
                        Account
                    </h2>

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">

                        {/* Change Password */}
                        <button
                            type="button"
                            className="flex w-full items-center justify-between border-b border-slate-200 px-4 py-3.5 text-left transition hover:bg-slate-50"
                        >
                            <div className="flex items-center gap-3">

                                <Shield
                                    size={15}
                                    strokeWidth={1.8}
                                    className="text-slate-500"
                                />

                                <span className="text-xs font-medium text-slate-700">
                                    Change password
                                </span>
                            </div>

                            <ChevronRight
                                size={14}
                                className="text-slate-400"
                            />
                        </button>

                        {/* Sign Out */}
                        <button
                            type="button"
                            onClick={() => {
                                void handleLogout();
                            }}
                            className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-slate-50"
                        >
                            <div className="flex items-center gap-3">

                                <LogOut
                                    size={15}
                                    strokeWidth={1.8}
                                    className="text-slate-500"
                                />

                                <span className="text-xs font-medium text-slate-700">
                                    Sign out
                                </span>
                            </div>

                            <ChevronRight
                                size={14}
                                className="text-slate-400"
                            />
                        </button>
                    </div>
                </section>

                {/* PREFERENCES */}
                <section className="border-b border-slate-200 py-7">

                    <h2 className="mb-3 text-xs font-semibold text-slate-900">
                        Preferences
                    </h2>

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">

                        {/* Save Scan History */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">

                            <div>
                                <p className="text-xs font-medium text-slate-700">
                                    Save scan history
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    Keep your scanned products in history.
                                </p>
                            </div>

                            <button
                                type="button"
                                aria-label="Toggle save scan history"
                                aria-pressed={saveHistory}
                                onClick={() =>
                                    setSaveHistory(
                                        (value) => !value,
                                    )
                                }
                                className={`relative h-5 w-9 rounded-full transition ${
                                    saveHistory
                                        ? "bg-blue-500"
                                        : "bg-slate-200"
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                                        saveHistory
                                            ? "left-[18px]"
                                            : "left-0.5"
                                    }`}
                                />
                            </button>
                        </div>

                        {/* AI Explanations */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3.5">

                            <div>
                                <p className="text-xs font-medium text-slate-700">
                                    AI explanations
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    Enable AI-powered product explanations.
                                </p>
                            </div>

                            <button
                                type="button"
                                aria-label="Toggle AI explanations"
                                aria-pressed={aiExplanations}
                                onClick={() =>
                                    setAiExplanations(
                                        (value) => !value,
                                    )
                                }
                                className={`relative h-5 w-9 rounded-full transition ${
                                    aiExplanations
                                        ? "bg-blue-500"
                                        : "bg-slate-200"
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                                        aiExplanations
                                            ? "left-[18px]"
                                            : "left-0.5"
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Currency */}
                        <div className="flex items-center justify-between px-4 py-3.5">

                            <div>
                                <p className="text-xs font-medium text-slate-700">
                                    Default currency
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    Currency used for product prices.
                                </p>
                            </div>

                            <select
                                value={currency}
                                onChange={(event) =>
                                    setCurrency(
                                        event.target.value,
                                    )
                                }
                                className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="USD">
                                    USD
                                </option>

                                <option value="INR">
                                    INR
                                </option>

                                <option value="EUR">
                                    EUR
                                </option>

                                <option value="GBP">
                                    GBP
                                </option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* ACCESSIBILITY */}
                <section className="py-7">

                    <h2 className="mb-3 text-xs font-semibold text-slate-900">
                        Accessibility
                    </h2>

                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">

                        <div className="flex items-center justify-between px-4 py-3.5">

                            <div>
                                <div className="flex items-center gap-2">

                                    <Moon
                                        size={14}
                                        strokeWidth={1.8}
                                        className="text-slate-500"
                                    />

                                    <p className="text-xs font-medium text-slate-700">
                                        Reduce motion
                                    </p>
                                </div>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                    Reduce animations and visual transitions.
                                </p>
                            </div>

                            <button
                                type="button"
                                aria-label="Toggle reduce motion"
                                aria-pressed={reduceMotion}
                                onClick={() =>
                                    setReduceMotion(
                                        (value) => !value,
                                    )
                                }
                                className={`relative h-5 w-9 rounded-full transition ${
                                    reduceMotion
                                        ? "bg-blue-500"
                                        : "bg-slate-200"
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                                        reduceMotion
                                            ? "left-[18px]"
                                            : "left-0.5"
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </section>

                {/* SETTINGS FOOTER */}
                <div className="flex items-center gap-2 pb-8 text-[11px] text-slate-400">
                    <Settings size={13} />
                    <span>
                        ScanIQ account settings
                    </span>
                </div>
            </div>
        </main>
    );
}

export default ProfilePage;
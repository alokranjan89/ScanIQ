import {
    ChevronRight,
    LogOut,
    Moon,
    Settings,
    Shield,
    Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import { changePassword } from "../api/auth.api";
import { loadPreferences, savePreferences } from "../lib/preferences";

function ProfilePage() {
    const {
        user,
        isLoading,
        logout,
        deleteAccount,
    } = useAuth();
    const navigate = useNavigate();
    const [showDeleteForm, setShowDeleteForm] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordChanged, setPasswordChanged] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [saveHistory, setSaveHistory] = useState(() => loadPreferences().saveHistory);
    const [aiExplanations, setAiExplanations] = useState(() => loadPreferences().aiExplanations);
    const [reduceMotion, setReduceMotion] = useState(() => loadPreferences().reduceMotion);

    useEffect(() => {
        savePreferences({ saveHistory, aiExplanations, reduceMotion });
        document.documentElement.dataset.reduceMotion = String(reduceMotion);
    }, [saveHistory, aiExplanations, reduceMotion]);

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

    const handleDeleteAccount = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setDeleteError("");
        setIsDeleting(true);
        try {
            await deleteAccount(deletePassword);
            navigate("/register", { replace: true });
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : "Unable to delete your account.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setPasswordError("");
        setPasswordChanged(false);
        if (newPassword !== confirmNewPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }
        setIsChangingPassword(true);
        try {
            await changePassword(currentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setPasswordChanged(true);
            setShowPasswordForm(false);
        } catch (error) {
            setPasswordError(error instanceof Error ? error.message : "Unable to change your password.");
        } finally {
            setIsChangingPassword(false);
        }
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
                            onClick={() => { setShowPasswordForm((shown) => !shown); setPasswordError(""); setPasswordChanged(false); }}
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
                    {passwordChanged && <p role="status" className="mt-3 text-sm text-emerald-700">Password changed successfully.</p>}
                    {showPasswordForm && (
                        <form onSubmit={(event) => void handleChangePassword(event)} className="mt-4 max-w-md space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                            <label className="block text-sm font-medium text-slate-700" htmlFor="current-password">Current password</label>
                            <input id="current-password" type="password" autoComplete="current-password" required maxLength={128} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                            <label className="block text-sm font-medium text-slate-700" htmlFor="change-new-password">New password</label>
                            <input id="change-new-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                            <label className="block text-sm font-medium text-slate-700" htmlFor="confirm-new-password">Confirm new password</label>
                            <input id="confirm-new-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={confirmNewPassword} onChange={(event) => setConfirmNewPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                            {passwordError && <p role="alert" className="text-sm text-red-700">{passwordError}</p>}
                            <button type="submit" disabled={isChangingPassword} className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{isChangingPassword ? "Updating…" : "Update password"}</button>
                        </form>
                    )}
                </section>

                <section className="border-b border-slate-200 py-7">
                    <h2 className="mb-2 text-xs font-semibold text-red-700">Delete account</h2>
                    <p className="mb-4 text-xs text-slate-500">This permanently removes your account, scan history, and favorites.</p>
                    {!showDeleteForm ? (
                        <button type="button" onClick={() => setShowDeleteForm(true)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                            <Trash2 size={15} /> Delete account
                        </button>
                    ) : (
                        <form onSubmit={(event) => void handleDeleteAccount(event)} className="max-w-md space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
                            <p className="text-sm font-medium text-red-800">Confirm your password to permanently delete this account.</p>
                            <label htmlFor="delete-account-password" className="sr-only">Current password</label>
                            <input id="delete-account-password" type="password" autoComplete="current-password" required maxLength={128} value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} placeholder="Current password" className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm" />
                            {deleteError && <p role="alert" className="text-sm text-red-700">{deleteError}</p>}
                            <div className="flex gap-2">
                                <button type="submit" disabled={isDeleting} className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{isDeleting ? "Deleting…" : "Permanently delete"}</button>
                                <button type="button" disabled={isDeleting} onClick={() => { setShowDeleteForm(false); setDeletePassword(""); setDeleteError(""); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700">Cancel</button>
                            </div>
                        </form>
                    )}
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

                        <div className="flex items-center justify-between px-4 py-3.5">
                            <div>
                                <p className="text-xs font-medium text-slate-700">Product price currency</p>
                                <p className="mt-0.5 text-[11px] text-slate-400">Prices use the currency reported by their source.</p>
                            </div>
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

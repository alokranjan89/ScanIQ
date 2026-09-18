import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import {
    ChevronRight,
    Heart,
    History,
    LogIn,
    LogOut,
    ScanLine,
    Search,
    Settings,
    UserPlus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

function Navbar() {
    const navigate = useNavigate();

    const {
        user,
        isAuthenticated,
        isLoading,
        logout,
    } = useAuth();

    const [isProfileOpen, setIsProfileOpen] =
        useState(false);

    const profileRef =
        useRef<HTMLDivElement>(null);

    /*
     * Close profile menu when clicking
     * anywhere outside the dropdown.
     */
    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent,
        ) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(
                    event.target as Node,
                )
            ) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside,
            );
        };
    }, []);

    const handleLogout = async () => {
        setIsProfileOpen(false);

        await logout();

        navigate("/");
    };

    const initials =
        user?.name
            ?.split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";

    return (
        <header className="sticky top-0 z-50 border-b border-white/70 bg-white/82 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-2"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-lg shadow-teal-700/20">
                        <ScanLine size={20} />
                    </span>

                    <span className="text-xl font-bold tracking-tight text-slate-950">
                        ScanIQ
                    </span>
                </Link>

                {/* Navigation */}
                <div className="flex items-center gap-2">

                    {/* Scan */}
                    <Link
                        to="/scan"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                        <ScanLine size={17} />

                        <span className="hidden sm:inline">
                            Scan
                        </span>
                    </Link>

                    {/* Search */}
                    <Link
                        to="/search"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                        <Search size={17} />

                        <span className="hidden sm:inline">
                            Search
                        </span>
                    </Link>

                    {/* Authenticated navigation */}
                    {!isLoading &&
                        isAuthenticated && (
                            <>
                                {/* History */}
                                <Link
                                    to="/history"
                                    className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:flex"
                                >
                                    <History size={17} />

                                    History
                                </Link>

                                {/* Favorites */}
                                <Link
                                    to="/favorites"
                                    className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:flex"
                                >
                                    <Heart size={17} />

                                    Favorites
                                </Link>

                                {/* Divider */}
                                <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

                                {/* Profile */}
                                <div
                                    ref={profileRef}
                                    className="relative"
                                >
                                    {/* Avatar Button */}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsProfileOpen(
                                                (value) =>
                                                    !value,
                                            )
                                        }
                                        aria-label="Open profile menu"
                                        aria-expanded={
                                            isProfileOpen
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white shadow-md shadow-teal-700/20 ring-2 ring-transparent transition hover:bg-teal-800 hover:ring-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-200"
                                    >
                                        {initials}
                                    </button>

                                    {/* Profile Dropdown */}
                                    {isProfileOpen && (
                                        <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">

                                            {/* User Info */}
                                            <div className="border-b border-slate-100 px-4 py-4">
                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                                                        {initials}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                            {user?.name}
                                                        </p>

                                                        <p className="mt-0.5 truncate text-xs text-slate-500">
                                                            {user?.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Profile & Settings */}
                                            <div className="p-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsProfileOpen(
                                                            false,
                                                        );

                                                        navigate(
                                                            "/profile",
                                                        );
                                                    }}
                                                    className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                                            <Settings
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </span>

                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800">
                                                                Profile & Settings
                                                            </p>

                                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                                Manage your account
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <ChevronRight
                                                        size={
                                                            16
                                                        }
                                                        className="text-slate-400"
                                                    />
                                                </button>
                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-slate-100 p-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        void handleLogout();
                                                    }}
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-red-600 transition hover:bg-red-50"
                                                >
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                                                        <LogOut
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </span>

                                                    <span className="text-sm font-medium">
                                                        Logout
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                    {/* Logged-out navigation */}
                    {!isLoading &&
                        !isAuthenticated && (
                            <>
                                {/* Sign in */}
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                                >
                                    <LogIn size={17} />

                                    <span className="hidden sm:inline">
                                        Sign in
                                    </span>
                                </Link>

                                {/* Register */}
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800"
                                >
                                    <UserPlus size={17} />

                                    <span className="hidden sm:inline">
                                        Register
                                    </span>
                                </Link>
                            </>
                        )}
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
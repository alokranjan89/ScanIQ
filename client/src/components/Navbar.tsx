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
        <header className="sticky top-0 z-50 border-b border-white/70 bg-white/85 shadow-sm shadow-slate-900/5 backdrop-blur-xl">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-2"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                        <ScanLine size={21} />
                    </span>

                    <span className="text-xl font-extrabold tracking-tight text-slate-950">
                        ScanIQ
                    </span>
                </Link>

                {/* Right side */}
                <div className="flex items-center gap-1 sm:gap-2">

                    {/* Scan */}
                    <Link
                        to="/scan"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                        <ScanLine size={18} />

                        <span className="hidden sm:inline">
                            Scan
                        </span>
                    </Link>

                    {/* Search */}
                    <Link
                        to="/search"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                        <Search size={18} />

                        <span className="hidden sm:inline">
                            Search
                        </span>
                    </Link>

                    {!isLoading &&
                        isAuthenticated && (
                            <>
                                {/* Desktop History */}
                                <Link
                                    to="/history"
                                    className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:flex"
                                >
                                    <History size={17} />

                                    History
                                </Link>

                                {/* Desktop Favorites */}
                                <Link
                                    to="/favorites"
                                    className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:flex"
                                >
                                    <Heart size={17} />

                                    Favorites
                                </Link>

                                {/* Divider */}
                                <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

                                {/* Avatar + Dropdown */}
                                <div
                                    ref={profileRef}
                                    className="relative ml-1"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsProfileOpen(
                                                (current) =>
                                                    !current,
                                            )
                                        }
                                        aria-label="Open account menu"
                                        aria-expanded={
                                            isProfileOpen
                                        }
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                    >
                                        {initials}
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">

                                            {/* User information */}
                                            <div className="border-b border-slate-100 px-4 py-4">
                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                                                        {initials}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-bold text-slate-950">
                                                            {user?.name}
                                                        </p>

                                                        <p className="truncate text-xs text-slate-500">
                                                            {user?.email}
                                                        </p>
                                                    </div>

                                                </div>
                                            </div>

                                            {/* Menu */}
                                            <div className="p-2">

                                                {/* Profile */}
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
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                                                >
                                                    <Settings
                                                        size={18}
                                                        className="text-slate-500"
                                                    />

                                                    <span className="flex-1">
                                                        Profile &
                                                        Settings
                                                    </span>

                                                    <ChevronRight
                                                        size={16}
                                                        className="text-slate-400"
                                                    />
                                                </button>

                                                {/* Favorites */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsProfileOpen(
                                                            false,
                                                        );

                                                        navigate(
                                                            "/favorites",
                                                        );
                                                    }}
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                                                >
                                                    <Heart
                                                        size={18}
                                                        className="text-slate-500"
                                                    />

                                                    <span className="flex-1">
                                                        Favorites
                                                    </span>

                                                    <ChevronRight
                                                        size={16}
                                                        className="text-slate-400"
                                                    />
                                                </button>

                                                {/* History */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsProfileOpen(
                                                            false,
                                                        );

                                                        navigate(
                                                            "/history",
                                                        );
                                                    }}
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                                                >
                                                    <History
                                                        size={18}
                                                        className="text-slate-500"
                                                    />

                                                    <span className="flex-1">
                                                        History
                                                    </span>

                                                    <ChevronRight
                                                        size={16}
                                                        className="text-slate-400"
                                                    />
                                                </button>

                                            </div>

                                            {/* Logout */}
                                            <div className="border-t border-slate-100 p-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void handleLogout()
                                                    }
                                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    <LogOut
                                                        size={18}
                                                    />

                                                    <span className="flex-1">
                                                        Logout
                                                    </span>
                                                </button>
                                            </div>

                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                    {/* Logged out */}
                    {!isLoading &&
                        !isAuthenticated && (
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                                >
                                    <LogIn size={17} />

                                    <span className="hidden sm:inline">
                                        Sign in
                                    </span>
                                </Link>

                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
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
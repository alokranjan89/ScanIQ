import { Link, useNavigate } from "react-router-dom";

import {
    Heart,
    History,
    LogIn,
    LogOut,
    ScanLine,
    Search,
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

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

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
                        <ScanLine
                            size={17}
                        />

                        <span className="hidden sm:inline">
                            Scan
                        </span>
                    </Link>

                    {/* Search */}
                    <Link
                        to="/search"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                    >
                        <Search
                            size={17}
                        />

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
                                    <History
                                        size={17}
                                    />

                                    History
                                </Link>

                                {/* Favorites */}
                                <Link
                                    to="/favorites"
                                    className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:flex"
                                >
                                    <Heart
                                        size={17}
                                    />

                                    Favorites
                                </Link>

                                {/* Divider */}
                                <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" />

                                {/* User */}
                                <span className="hidden max-w-32 truncate rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 md:block">
                                    {user?.name ?? user?.email}
                                </span>

                                {/* Logout */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleLogout();
                                    }}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700"
                                >
                                    <LogOut
                                        size={17}
                                    />

                                    <span className="hidden sm:inline">
                                        Logout
                                    </span>
                                </button>
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
                                    <LogIn
                                        size={17}
                                    />

                                    <span className="hidden sm:inline">
                                        Sign in
                                    </span>
                                </Link>

                                {/* Register */}
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-700/20 transition hover:bg-teal-800"
                                >
                                    <UserPlus
                                        size={17}
                                    />

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

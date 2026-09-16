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
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
            <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link
                    to="/"
                    className="flex items-center gap-2"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 text-slate-950">
                        <ScanLine size={20} />
                    </span>

                    <span className="text-xl font-bold tracking-tight text-white">
                        ScanIQ
                    </span>
                </Link>

                {/* Navigation */}
                <div className="flex items-center gap-2">

                    {/* Scan */}
                    <Link
                        to="/scan"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
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
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
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
                                    className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white sm:flex"
                                >
                                    <History
                                        size={17}
                                    />

                                    History
                                </Link>

                                {/* Favorites */}
                                <Link
                                    to="/favorites"
                                    className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white sm:flex"
                                >
                                    <Heart
                                        size={17}
                                    />

                                    Favorites
                                </Link>

                                {/* Divider */}
                                <div className="mx-1 hidden h-6 w-px bg-slate-800 sm:block" />

                                {/* User */}
                                <span className="hidden max-w-32 truncate text-sm text-slate-400 md:block">
                                    {user?.name}
                                </span>

                                {/* Logout */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        void handleLogout();
                                    }}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
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
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
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
                                    className="flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
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
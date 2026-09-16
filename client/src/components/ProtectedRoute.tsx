import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Wait until the application finishes restoring
    // the existing authentication session.
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                    <p className="text-sm text-gray-600">
                        Checking your session...
                    </p>
                </div>
            </div>
        );
    }

    // User is not authenticated.
    // Remember the page they originally wanted to visit.
    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location.pathname + location.search,
                }}
            />
        );
    }

    // User is authenticated.
    return <Outlet />;
}

export default ProtectedRoute;
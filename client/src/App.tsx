import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ScannerPage from "./pages/ScannerPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HistoryPage from "./pages/HistoryPage";
import FavoritesPage from "./pages/FavoritesPage";
import SearchPage from "./pages/SearchPage";
import AIPage from "./pages/AIPage";
import ComparisonPage from "./pages/ComparisonPage";
import VerificationPage from "./pages/VerificationPage";
import ProfilePage from "./pages/ProfilePage";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    {/* =========================
                        PUBLIC AUTH ROUTES
                       ========================= */}

                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/register"
                        element={<RegisterPage />}
                    />


                    {/* =========================
                        PROTECTED APPLICATION
                       ========================= */}

                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>

                            {/* Home */}
                            <Route
                                path="/"
                                element={<HomePage />}
                            />

                            {/* Scanner */}
                            <Route
                                path="/scan"
                                element={<ScannerPage />}
                            />

                            {/* Search */}
                            <Route
                                path="/search"
                                element={<SearchPage />}
                            />

                            {/* Product */}
                            <Route
                                path="/products/:barcode"
                                element={<ProductDetailsPage />}
                            />

                            {/* AI */}
                            <Route
                                path="/products/:barcode/ai"
                                element={<AIPage />}
                            />

                            {/* Verification */}
                            <Route
                                path="/products/:productId/verification"
                                element={<VerificationPage />}
                            />

                            {/* Comparison */}
                            <Route
                                path="/compare"
                                element={<ComparisonPage />}
                            />

                            {/* History */}
                            <Route
                                path="/history"
                                element={<HistoryPage />}
                            />

                            {/* Favorites */}
                            <Route
                                path="/favorites"
                                element={<FavoritesPage />}
                            />

                            {/* Profile */}
                            <Route
                                path="/profile"
                                element={<ProfilePage />}
                            />

                        </Route>
                    </Route>


                    {/* =========================
                        UNKNOWN ROUTES
                       ========================= */}

                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
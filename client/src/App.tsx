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

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import { AuthProvider } from "./context/AuthContext";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    {/* =========================
                        PUBLIC ROUTES
                    ========================= */}

                    <Route element={<MainLayout />}>

                        <Route
                            path="/"
                            element={<HomePage />}
                        />

                        <Route
                            path="/scan"
                            element={<ScannerPage />}
                        />

                        <Route
                            path="/search"
                            element={<SearchPage />}
                        />

                        <Route
                            path="/products/:barcode"
                            element={
                                <ProductDetailsPage />
                            }
                        />

                        <Route
                            path="/products/:barcode/ai"
                            element={
                                <AIPage />
                            }
                        />

                        <Route
                            path="/products/:productId/verification"
                            element={
                                <VerificationPage />
                            }
                        />

                        <Route
                            path="/compare"
                            element={
                                <ComparisonPage />
                            }
                        />

                    </Route>


                    {/* =========================
                        AUTH ROUTES
                    ========================= */}

                    <Route
                        path="/login"
                        element={<LoginPage />}
                    />

                    <Route
                        path="/register"
                        element={
                            <RegisterPage />
                        }
                    />


                    {/* =========================
                        PROTECTED ROUTES
                    ========================= */}

                    <Route
                        element={
                            <ProtectedRoute />
                        }
                    >

                        <Route
                            element={
                                <MainLayout />
                            }
                        >

                            <Route
                                path="/history"
                                element={
                                    <HistoryPage />
                                }
                            />

                            <Route
                                path="/favorites"
                                element={
                                    <FavoritesPage />
                                }
                            />

                        </Route>

                    </Route>


                    {/* =========================
                        FALLBACK
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
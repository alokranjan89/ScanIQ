import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProductDetailsPage from "./pages/ProductDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Product details */}
        <Route
          path="/products/:barcode"
          element={<ProductDetailsPage />}
        />

        {/* Default route */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">
                  ScanIQ
                </h1>

                <p className="text-slate-400">
                  Scan. Verify. Understand.
                </p>
              </div>
            </div>
          }
        />

        {/* Unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
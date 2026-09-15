import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BarcodeScanner from "../components/BarcodeScanner";
import { getProductByBarcode } from "../services/product.service";

function ScannerPage() {
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = useCallback(
    async (decodedBarcode: string) => {
      const normalizedBarcode = decodedBarcode.trim();

      if (!normalizedBarcode || isLoading) {
        return;
      }

      setBarcode(normalizedBarcode);
      setError("");
      setIsScanning(false);
      setIsLoading(true);

      try {
        const product = await getProductByBarcode(
          normalizedBarcode,
        );

        navigate(`/products/${product.id}`);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to find this product.";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, navigate],
  );

  const handleScannerError = useCallback(
    (message: string) => {
      setError(message);
      setIsScanning(false);
    },
    [],
  );

  const handleManualSearch = async () => {
    const normalizedBarcode = barcode.trim();

    if (!normalizedBarcode) {
      setError("Please enter a barcode.");
      return;
    }

    await handleScan(normalizedBarcode);
  };

  const handleStartScanner = () => {
    setError("");
    setIsScanning(true);
  };

  const handleCancelScanner = () => {
    setIsScanning(false);
    setError("");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-slate-400 transition hover:text-white"
          >
            ← Back to Home
          </Link>

          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Scan a Product
          </h1>

          <p className="mt-2 text-slate-400">
            Scan a QR code or barcode to discover product
            information.
          </p>
        </header>

        {/* Scanner */}
        {isScanning ? (
          <section>
            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-black">
              <BarcodeScanner
                onScan={handleScan}
                onError={handleScannerError}
              />
            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-4 text-center">
              <p className="font-medium">
                Position the barcode inside the frame
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Keep your camera steady and make sure the
                barcode is clearly visible.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancelScanner}
              className="mt-5 w-full rounded-xl border border-slate-700 px-6 py-3 font-medium transition hover:bg-slate-900"
            >
              Cancel Scanner
            </button>
          </section>
        ) : (
          <section>
            <div className="flex aspect-square items-center justify-center rounded-2xl border border-slate-700 bg-slate-900">
              <div className="px-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-3xl">
                  📷
                </div>

                <h2 className="mt-5 text-xl font-semibold">
                  Ready to scan
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  Use your camera to scan a QR code or
                  supported product barcode.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartScanner}
              disabled={isLoading}
              className="mt-6 w-full rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start Camera
            </button>
          </section>
        )}

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-800" />

          <span className="text-sm text-slate-500">
            OR
          </span>

          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Manual Barcode */}
        <section>
          <label
            htmlFor="barcode"
            className="mb-2 block text-sm font-medium"
          >
            Enter barcode manually
          </label>

          <div className="flex gap-3">
            <input
              id="barcode"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={barcode}
              onChange={(event) => {
                setBarcode(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleManualSearch();
                }
              }}
              placeholder="e.g. 012993441012"
              disabled={isLoading}
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 transition focus:border-slate-500 focus:ring-2 focus:ring-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() => void handleManualSearch()}
              disabled={isLoading}
              className="rounded-xl bg-slate-800 px-5 py-3 font-medium transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </section>

        {/* Supported formats */}
        <section className="mt-8">
          <p className="text-sm font-medium text-slate-300">
            Supported codes
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "QR Code",
              "EAN-13",
              "EAN-8",
              "UPC",
              "ISBN",
            ].map((format) => (
              <span
                key={format}
                className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400"
              >
                {format}
              </span>
            ))}
          </div>
        </section>

        {/* Loading */}
        {isLoading && (
          <div
            role="status"
            className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-white" />

              <div>
                <p className="text-sm font-medium">
                  Finding product...
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Checking available product sources.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-900/50 bg-red-950/30 p-4"
          >
            <p className="font-medium text-red-300">
              Unable to find product
            </p>

            <p className="mt-1 text-sm text-red-400">
              {error}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default ScannerPage;
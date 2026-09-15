import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-bold">
            ScanIQ
          </Link>

          <Link
            to="/scan"
            className="rounded-xl bg-white px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-slate-200"
          >
            Scan
          </Link>
        </div>
      </header>

      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
          Scan. Verify. Understand.
        </p>

        <h1 className="mt-5 text-5xl font-bold tracking-tight sm:text-7xl">
          Know what you scan.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          Scan a QR code or barcode to discover product information,
          ingredients, nutrition, verification details, and AI-powered
          explanations.
        </p>

        <Link
          to="/scan"
          className="mt-10 rounded-xl bg-white px-7 py-4 font-semibold text-slate-950 transition hover:bg-slate-200"
        >
          Scan a Product
        </Link>
      </section>
    </main>
  );
}

export default HomePage;
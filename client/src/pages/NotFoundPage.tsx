import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-6">
      <div className="surface w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-center shadow-xl backdrop-blur-md">
        <p className="eyebrow text-teal-700">404 Error</p>

        <h1 className="mt-3 text-3xl font-extrabold text-slate-950">
          Page not found
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="btn-primary mt-6 inline-flex"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
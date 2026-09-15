import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="text-center">
        <p className="text-6xl font-bold">404</p>

        <h1 className="mt-4 text-2xl font-semibold">
          Page not found
        </h1>

        <p className="mt-2 text-slate-400">
          The page you're looking for doesn't exist.
        </p>

        <Link
          to="/"
          className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-slate-950"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}

export default NotFoundPage;
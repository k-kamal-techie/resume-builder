import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-300 dark:text-slate-600">404</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-4">Page not found</p>
        <Link
          href="/"
          className="inline-block mt-6 rounded-lg bg-accent-600 px-6 py-2 text-sm font-medium text-white hover:bg-accent-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

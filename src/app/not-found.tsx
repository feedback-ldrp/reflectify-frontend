// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-light-background dark:bg-dark-background text-center p-4">
      <h1 className="text-6xl font-bold text-light-text dark:text-dark-text mb-4">
        404
      </h1>
      <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mb-6">
        Page Not Found
      </h2>
      <p className="text-lg text-light-muted-text dark:text-dark-muted-text mb-8">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-light-highlight dark:bg-dark-highlight text-white rounded-lg hover:bg-primary-dark transition-all duration-200 text-lg font-medium shadow-sm hover:shadow-md"
      >
        Go to Home
      </Link>
    </div>
  );
}

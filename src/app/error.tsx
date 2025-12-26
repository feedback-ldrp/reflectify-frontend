// src/app/error.tsx
"use client"; // Error components must be Client Components

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-light-background dark:bg-dark-background text-center p-4">
            <h2 className="text-4xl font-bold text-red-600 dark:text-red-500 mb-4">
                Something went wrong!
            </h2>
            <p className="text-lg text-light-muted-text dark:text-dark-muted-text mb-6">
                An unexpected error occurred.
            </p>
            <div className="space-x-4">
                <button
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-lg font-medium"
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                >
                    Try again
                </button>
                <Link
                    href="/"
                    className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-lg font-medium"
                >
                    Go to Home
                </Link>
            </div>
            {/* Optionally display error details in development */}
            {process.env.NODE_ENV === "development" && (
                <pre className="mt-8 p-4 bg-light-muted-background dark:bg-dark-muted-background rounded-lg text-left text-sm text-light-text dark:text-dark-text overflow-auto max-w-lg">
                    <code>{error.message}</code>
                    {error.digest && (
                        <code className="block mt-2">
                            Digest: {error.digest}
                        </code>
                    )}
                </pre>
            )}
        </div>
    );
}

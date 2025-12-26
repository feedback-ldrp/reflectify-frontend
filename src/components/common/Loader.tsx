// src/components/ui/Loader.tsx
"use client"; // This component needs to be a Client Component as it's purely UI and might be used in client contexts.

import React from "react";

interface LoaderProps {
    /**
     * Size of the loader. Can be 'sm', 'md', 'lg', 'xl', or a custom Tailwind size class (e.g., 'w-12 h-12').
     * Defaults to 'md'.
     */
    size?: "sm" | "md" | "lg" | "xl" | string;
    /**
     * Color of the loader. Uses Tailwind CSS color classes (e.g., 'text-blue-500', 'text-primary-dark').
     * Defaults to 'text-primary-dark'.
     */
    color?: string;
    /**
     * Additional Tailwind CSS classes to apply to the loader container.
     */
    className?: string;
}

/**
 * A versatile and visually appealing spinning loader component.
 *
 * @param {LoaderProps} props - The properties for the Loader component.
 * @returns {JSX.Element} The Loader component.
 */
export default function Loader({
    size = "md",
    color = "text-light-text dark:text-dark-text",
    className = "bg-transparent",
}: LoaderProps) {
    // Map size prop to Tailwind CSS classes
    const sizeClasses: { [key: string]: string } = {
        sm: "w-5 h-5 border-2",
        md: "w-8 h-8 border-2",
        lg: "w-12 h-12 border-4",
        xl: "w-16 h-16 border-4",
    };

    // Determine the final size class. If 'size' is a custom string, use it directly.
    const finalSizeClass = sizeClasses[size] || size;

    return (
        <div
            role="status" // Good for accessibility, indicates a status update
            aria-label="Loading" // Provides a label for screen readers
            className={`flex items-center justify-center ${className}`}
        >
            <div
                className={`animate-spin rounded-full border-solid border-current border-r-transparent ${finalSizeClass} ${color}`}
            >
                {/* Visually hidden text for screen readers while loading */}
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
}

export { Loader }; // Export for potential reuse in other components

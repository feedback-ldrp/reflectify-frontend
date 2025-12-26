/**
 * @file src/app/(main)/layout.tsx
 * @description Layout component for the main group of the Reflectify application
 */

import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Metadata for the main group layout
export const metadata: Metadata = {
    title: "Reflectify - Admin",
    description: "Main pages of the Reflectify application",
    keywords: ["main", "reflectify", "feedback", "system"],
    authors: [
        { name: "Kandarp Gajjar", url: "https://github.com/slantie" },
        { name: "Harsh Dodiya", url: "https://github.com/harshDodiya1" },
    ],
    icons: {
        icon: "/favicon.ico",
    },
};

export default function MainGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute requireAuth={true}>
            <>
                <div className="sticky top-0 z-50 bg-white dark:bg-dark-background border-b border-secondary-lighter dark:border-dark-secondary">
                    <Header />
                </div>
                <main>{children}</main> <Footer />
            </>
        </ProtectedRoute>
    );
}

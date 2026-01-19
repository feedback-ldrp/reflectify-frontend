/**
 * @file src/app/(main)/layout.tsx
 * @description Layout component for the main group of the Reflectify application
 */

import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

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
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-50 bg-white dark:bg-dark-background border-b border-secondary-lighter dark:border-dark-secondary">
          <Header />
        </div>
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <Breadcrumbs />
              {children}
            </div>
          </main>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

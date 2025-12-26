/**
 * @file src/app/layout.tsx
 * @description Root layout for the Reflectify app, sets up global providers and theme.
 */

import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/providers/ToastProvider";

import { DM_Sans } from "next/font/google";

export const metadata: Metadata = {
    title: "Reflectify - Feedback System",
    description: "A comprehensive student feedback management system",
    keywords: ["feedback", "student", "management", "system"],
    authors: [
        { name: "Kandarp Gajjar", url: "https://github.com/slantie" },
        { name: "Harsh Dodiya", url: "https://github.com/harshDodiya1" },
    ],
    icons: {
        icon: "/favicon.ico",
    },
};

const dmsans = DM_Sans({
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={dmsans.className}>
                <ThemeProvider>
                    <ReactQueryProvider>
                        <AuthProvider>
                            <ToastProvider>{children}</ToastProvider>
                        </AuthProvider>
                    </ReactQueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

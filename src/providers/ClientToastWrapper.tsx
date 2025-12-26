// src/components/providers/ClientToastWrapper.tsx
"use client"; // This component is explicitly a client component

import { ToastProvider } from "@/providers/ToastProvider";
import React from "react";

/**
 * A client component wrapper for ToastProvider.
 * This allows ToastProvider to be dynamically imported with ssr: false
 * from a Server Component (like layout.tsx).
 */
export default function ClientToastWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ToastProvider>{children}</ToastProvider>;
}

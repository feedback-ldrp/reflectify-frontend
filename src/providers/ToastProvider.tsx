// src/components/providers/ToastProvider.tsx
"use client";

import { Toaster } from "react-hot-toast";
import React, { useState, useEffect } from "react"; // <--- ADDED: Import useState and useEffect

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false); // <--- ADDED: State to track if component is mounted on client

    // <--- ADDED: useEffect to set mounted to true only on the client-side after hydration
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            {children}
            {/* <--- MODIFIED: Conditionally render Toaster only on the client after mounting */}
            {mounted && (
                <Toaster
                    position="bottom-right"
                    reverseOrder={false}
                    gutter={8}
                    containerStyle={{
                        top: 20,
                        right: 20,
                    }}
                    toastOptions={{
                        duration: 5000,
                        style: {
                            borderRadius: "10px",
                            background: "#333",
                            color: "#fff",
                        },
                        success: {
                            duration: 5000,
                        },
                        error: {
                            duration: 20000,
                        },
                        loading: {
                            duration: Infinity,
                        },
                    }}
                />
            )}
        </>
    );
}

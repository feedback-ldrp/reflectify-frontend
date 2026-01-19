// src/components/providers/ToastProvider.tsx
"use client";

import { Toaster } from "react-hot-toast";
import React, { useState, useEffect } from "react";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {children}
      {mounted && (
        <Toaster
          position="bottom-right"
          reverseOrder={false}
          gutter={12}
          containerStyle={{
            bottom: 24,
            right: 24,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              padding: "14px 18px",
              background: isDark ? "#1e293b" : "#ffffff",
              color: isDark ? "#f1f5f9" : "#1e293b",
              border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
              boxShadow: isDark
                ? "0 10px 25px -5px rgba(0, 0, 0, 0.4)"
                : "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              fontSize: "14px",
              maxWidth: "400px",
            },
            success: {
              duration: 4000,
              iconTheme: {
                primary: "#22c55e",
                secondary: isDark ? "#1e293b" : "#ffffff",
              },
            },
            error: {
              duration: 6000,
              iconTheme: {
                primary: "#ef4444",
                secondary: isDark ? "#1e293b" : "#ffffff",
              },
            },
            loading: {
              duration: Infinity,
              iconTheme: {
                primary: "#3b82f6",
                secondary: isDark ? "#1e293b" : "#ffffff",
              },
            },
          }}
        />
      )}
    </>
  );
}

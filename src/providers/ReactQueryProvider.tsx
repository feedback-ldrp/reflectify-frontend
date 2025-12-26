// src/providers/ReactQueryProvider.tsx
"use client"; // This component itself is a client component

import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Function to create a new QueryClient instance
function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching on first mount.
                // 1 minute is a reasonable default for most data.
                staleTime: 60 * 1000, // 1 minute
                refetchOnWindowFocus: false, // Keep your existing option
            },
        },
    });
}

// A global variable to hold the browser's QueryClient instance.
// This ensures that in the browser, we reuse the same client across re-renders
// and different components, preventing accidental sharing in strict mode.
let browserQueryClient: QueryClient | undefined = undefined;

// Function to get or create a QueryClient instance based on the environment
function getQueryClient() {
    // Server-side: Always create a new QueryClient for each request/render.
    // This is crucial to prevent state from leaking between different server renders.
    if (typeof window === "undefined") {
        return makeQueryClient();
    } else {
        // Client-side: Reuse the existing QueryClient if it exists, otherwise create a new one.
        // This ensures consistent caching and state management on the client.
        if (!browserQueryClient) {
            browserQueryClient = makeQueryClient();
        }
        return browserQueryClient;
    }
}

interface ReactQueryProviderProps {
    children: ReactNode;
}

/**
 * ReactQueryProvider component to wrap your application and provide
 * the React Query client context to all child components,
 * with SSR-safe initialization.
 */
export default function ReactQueryProvider({
    children,
}: ReactQueryProviderProps) {
    // Get the appropriate QueryClient instance for the current environment.
    // This function is called on every render, but `getQueryClient` ensures
    // the correct instance (new for server, cached for client) is returned.
    const queryClient = getQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* React Query Devtools are optional and only for development */}
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
}

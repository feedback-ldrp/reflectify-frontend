"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
// import { showToast } from "@/lib/toast";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { showToast } from "@/lib/toast";

interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: string[]; // Expected user designations
    fallbackPath?: string; // Path to redirect if requireAuth fails
    requireAuth?: boolean;
    requireSuper?: boolean;
    // Optional: specific fallback paths for role/super failures
    superFallbackPath?: string;
    roleFallbackPath?: string;
}

export function ProtectedRoute({
    children,
    roles = [],
    requireAuth = true,
    requireSuper = false,
    fallbackPath = "/", // Default for general auth failure
    superFallbackPath = "/", // Default for super admin failure
    roleFallbackPath = "/", // Default for role failure
}: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const redirectAttempted = useRef(false); // To prevent multiple redirects/flickering

    useEffect(() => {
        // Only run checks if not loading and a redirect hasn't already been attempted
        if (loading || redirectAttempted.current) {
            return;
        }

        let shouldRedirect = false;
        let redirectTo = fallbackPath;
        let errorMessage = "";

        // 1. Check if authentication is required
        if (requireAuth && !user) {
            shouldRedirect = true;
            // errorMessage = "You need to be logged in to access this page";
            redirectTo = fallbackPath;
        }
        // 2. If user is authenticated, perform additional checks
        else if (user) {
            // Check if super admin access is required
            if (requireSuper && !user.isSuper) {
                shouldRedirect = true;
                errorMessage =
                    "You need super admin privileges to access this page";
                redirectTo = superFallbackPath;
            }
            // Check if specific roles are required (based on designation)
            else if (roles.length > 0) {
                const userDesignation = user.designation?.toLowerCase();
                const hasRequiredRole = roles.some(
                    (role) => role.toLowerCase() === userDesignation
                );

                if (!hasRequiredRole) {
                    shouldRedirect = true;
                    errorMessage =
                        "You don't have permission to access this page";
                    redirectTo = roleFallbackPath;
                }
            }
        }

        if (shouldRedirect) {
            showToast.error(errorMessage || "Access denied");
            router.replace(redirectTo);
            redirectAttempted.current = true;
        }
    }, [
        user,
        loading,
        roles,
        requireAuth,
        requireSuper,
        fallbackPath,
        superFallbackPath,
        roleFallbackPath,
        router,
    ]);

    if (
        loading ||
        (!user && requireAuth && !redirectAttempted.current) ||
        (user &&
            ((requireSuper && !user.isSuper) ||
                (roles.length > 0 &&
                    !roles.some(
                        (role) =>
                            role.toLowerCase() ===
                            user.designation?.toLowerCase()
                    ))) &&
            !redirectAttempted.current)
    ) {
        return <PageLoader text="Loading" />;
    }

    // If a redirect was attempted, don't render children
    if (redirectAttempted.current) {
        return null;
    }

    // If all checks pass and no redirect was needed, render the protected content
    return <>{children}</>;
}

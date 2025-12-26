/**
 * @file src/contexts/AuthContext.tsx
 * @description Authentication context and provider for user state and actions
 */
"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { showToast } from "@/lib/toast";
import authService from "@/services/authService";
import { Admin } from "@/interfaces/auth";

// Auth context type
interface AuthContextType {
    user: Admin | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

// Create the context
// The default value is undefined, and the useAuth hook checks for this.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider for authentication state
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true); // Keep loading true initially for SSR
    // Removed initialLoad state as it caused the SSR issue by returning null prematurely.
    const router = useRouter();

    // Check authentication status
    const checkAuth = useCallback(async () => {
        setLoading(true); // Indicate loading state
        try {
            // Cookies.get is safe as js-cookie handles server/client environments.
            // On the server, it reads from req.headers.cookie (if available).
            // On the client, it reads from document.cookie.
            const token = Cookies.get("authToken");
            if (!token) {
                setUser(null);
                return;
            }
            const response = await authService.getMe();
            setUser(response.data.admin);
        } catch (error) {
            // Handle errors during authentication check (e.g., token expired/invalid)
            showToast.error("Authentication check failed: " + error);
            Cookies.remove("authToken"); // Clear invalid token
            setUser(null); // Ensure user is null on failure
        } finally {
            setLoading(false); // Authentication check is complete
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Handle user login
    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login(email, password);
            const {
                token,
                data: { admin: userData },
            } = response;
            // Set cookie on client-side
            Cookies.set("authToken", token, {
                expires: 7,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax",
            });
            setUser(userData);
            showToast.success("Logged in successfully!");
            router.replace("/dashboard");
        } catch (error) {
            showToast.error("Login failed: " + error);
            throw new Error("Login failed"); // Re-throw for component to catch if needed
        }
    };

    // Handle user logout
    const logout = async () => {
        try {
            Cookies.remove("authToken");
            setUser(null);
            showToast.success("Logged out successfully!");
            router.replace("/");
        } catch (error) {
            showToast.error("Failed to log out: " + error);
            // Ensure user is null even if toast fails
            Cookies.remove("authToken");
            setUser(null);
        }
    };

    // The AuthContext.Provider is ALWAYS rendered, even during SSR.
    // The `loading` state will indicate if the initial client-side auth check is pending.
    return (
        <AuthContext.Provider
            value={{ user, loading, login, logout, checkAuth }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        // This error will now only be thrown if useAuth is called outside of AuthProvider
        // on the client, or if the AuthProvider is somehow not in the tree during SSR.
        // With the fix above, the provider is always in the tree.
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

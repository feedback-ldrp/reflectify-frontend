// src/providers/ThemeProvider.tsx
"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";

// Define the shape of the theme context
interface ThemeContextType {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

// Create the context with an initial undefined value.
// The useTheme hook will check for this undefined value.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    // State to manage the theme. Initialize to false (light) as a default for SSR.
    // The actual detection will happen in useEffect on the client.
    const [isDarkMode, setIsDark] = useState<boolean>(false);
    // `isClient` state helps ensure client-side specific logic only runs after hydration.
    const [isClient, setIsClient] = useState<boolean>(false); // Renamed from 'mounted' for clarity

    // Effect to read theme from localStorage or system preference after hydration
    useEffect(() => {
        // Only execute this block if we are definitely on the client-side
        if (typeof window !== "undefined") {
            setIsClient(true); // Mark component as client-side mounted

            const storedTheme = localStorage.getItem("theme");
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

            // Function to apply theme to documentElement
            const applyTheme = (dark: boolean) => {
                setIsDark(dark);
                // Ensure document.documentElement exists before manipulating classes
                if (document.documentElement) {
                    // <--- CRITICAL ADDITION/CONFIRMATION
                    document.documentElement.classList.toggle("dark", dark);
                    document.documentElement.classList.toggle("light", !dark); // Optional: add 'light' class
                }
            };

            // Initial theme setting based on stored preference or system preference
            if (storedTheme === "dark") {
                applyTheme(true);
            } else if (storedTheme === "light") {
                applyTheme(false);
            } else {
                // If no stored theme, use system preference
                applyTheme(prefersDark.matches);
            }

            // Listener for system theme changes
            const mediaQueryListener = (e: MediaQueryListEvent) => {
                applyTheme(e.matches);
            };
            prefersDark.addEventListener("change", mediaQueryListener);

            // Cleanup listener
            return () => {
                prefersDark.removeEventListener("change", mediaQueryListener);
            };
        }
    }, []); // Run once on client mount

    // Function to toggle theme, also updates localStorage
    const toggleTheme = useCallback(() => {
        // Ensure this only runs on the client AND document.documentElement exists
        if (typeof window !== "undefined" && document.documentElement) {
            // <--- CRITICAL ADDITION/CONFIRMATION
            setIsDark((prevIsDark) => {
                const newIsDark = !prevIsDark;
                localStorage.setItem("theme", newIsDark ? "dark" : "light");
                document.documentElement.classList.toggle("dark", newIsDark);
                document.documentElement.classList.toggle("light", !newIsDark);
                return newIsDark;
            });
        }
    }, []);

    // The context value to be provided.
    // During SSR, `isClient` is false, so `isDarkMode` will be its initial `useState` value (false).
    // This ensures the provider is always rendered and `isDarkMode` has a valid boolean value,
    // preventing `useContext` errors on the server.
    const contextValue: ThemeContextType = {
        isDarkMode: isClient ? isDarkMode : false, // Provide a default for SSR
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
}

// Custom hook to consume the theme context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        // This error will now only be thrown if useTheme is called outside of ThemeProvider.
        // With the fix above, the provider is always in the tree during SSR.
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

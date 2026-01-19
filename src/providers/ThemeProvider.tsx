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
  // Always use light mode - dark mode disabled
  const [isDarkMode, setIsDark] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);

  // Effect to ensure light mode is always applied
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
      // Always force light mode
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, []);

  // Toggle function does nothing now (dark mode disabled)
  const toggleTheme = useCallback(() => {
    // Dark mode disabled - do nothing
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

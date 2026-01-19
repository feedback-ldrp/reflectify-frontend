// src/components/ui/ThemeToggle.tsx
"use client";

import React from "react"; // No need for useState, useEffect here anymore
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils"; // Import the cn utility
import { useTheme } from "@/providers/ThemeProvider"; // Import useTheme hook

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-lg border transition-all duration-200",
        "bg-light-secondary dark:bg-dark-secondary",
        "border-light-secondary dark:border-dark-secondary",
        "hover:border-primary-main dark:hover:border-primary-main",
        "hover:bg-light-muted-background dark:hover:bg-dark-muted-background",
        "focus:outline-none focus:ring-2 focus:ring-primary-main/20",
      )}
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-light-highlight dark:text-dark-highlight" />
      ) : (
        <Moon className="w-5 h-5 text-secondary-dark dark:text-dark-text" />
      )}
    </button>
  );
}

export default ThemeToggle;

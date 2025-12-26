// File: tailwind.config.ts

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      colors: {
        primary: {
          main: "#f97316", // Primary orange (your highlight color)
          light: "#fb923c", // Lighter orange
          lighter: "#fff7ed", // Soft background (used for light loading toast bg)
          dark: "#ea580c", // Darker primary
          darker: "#c2410c", // Even darker for contrast
          // New shades for loading toast specific needs
          textDark: "#ffb762", // Brighter text for dark loading toast
          bgDark: "#8d4a1e", // Very dark, slightly orange-tinted background for dark loading toast
          borderLight: "#fbd29a", // Lighter border for light loading toast
        },

        secondary: {
          lighter: "#f9fafb", // gray-50
          light: "#e5e7eb", // gray-200
          main: "#9ca3af", // gray-400
          dark: "#4b5563", // gray-600
          darker: "#1f2937", // gray-800
        },

        positive: {
          // Success colors
          lighter: "#f0fdf4", // Light theme success background
          light: "#bbf7d0", // Light theme success border
          main: "#15803d", // Light theme success text
          dark: "#22c55e", // Dark theme success border
          darker: "#166534", // Dark theme success background
          textDark: "#a7f3d0", // Dark theme success text
        },

        warning: {
          // Warning colors
          lighter: "#fff8e6", // Light theme warning background
          light: "#ffecb2", // Light theme warning border
          main: "#d97706", // Light theme warning text
          dark: "#b45309", // Dark theme warning border
          darker: "#4d2b0e", // Dark theme warning background
          textDark: "#ffb64a", // Dark theme warning text
        },

        negative: {
          // Error colors
          lighter: "#fef2f2", // Light theme error background
          light: "#fecaca", // Light theme error border
          main: "#dc2626", // Light theme error text
          dark: "#ef4444", // Dark theme error border
          darker: "#991b1b", // Dark theme error background
          textDark: "#fca5a5", // Dark theme error text
        },

        highlight1: {
          // Info colors (renamed from 'info' to fit your existing structure)
          lighter: "#e0efff", // Light theme info background
          light: "#c6e1ff", // Light theme info border
          main: "#2563eb", // Light theme info text
          dark: "#3b82f6", // Dark theme info border
          darker: "#1f3a61", // Dark theme info background
          textDark: "#93c5fd", // Dark theme info text
        },

        highlight2: {
          lighter: "#f3e8ff", // purple-50
          light: "#e9d5ff", // purple-200
          main: "#c084f1", // purple-500
          dark: "#a855f7", // purple-600
          darker: "#9333ea", // purple-900
        },

        dark: {
          text: "#DFDFD6",
          background: "#1B1B1F",
          highlight: "#f97316", // primary main for highlight
          muted: {
            text: "#FFFFFF",
            background: "#202127",
          },
          noisy: {
            text: "#98989F",
            background: "#161618",
          },
          hover: "#414853",
          secondary: "#32363F", // Used for default toast border in dark mode
          tertiary: "#98989F",
        },

        light: {
          text: "#3C3C43",
          background: "#FFFFFF",
          highlight: "#f97316", // primary main for highlight
          muted: {
            text: "#67676C",
            background: "#F6F6F7",
          },
          noisy: {
            text: "#67676C",
            background: "#C2C2C4",
          },
          hover: "#E4E4E9",
          secondary: "#EBEBEF", // Used for default toast border in light mode
          tertiary: "#98989F",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

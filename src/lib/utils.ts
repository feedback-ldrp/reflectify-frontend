/**
 * @file src/lib/utils.ts
 * @description Utility for merging Tailwind and conditional classes
 */

"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind and conditional classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

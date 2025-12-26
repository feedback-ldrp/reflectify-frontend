/**
 * @file src/lib/toast.ts
 * @description Toast utility and helpers for notifications
 */

"use client";

import toast, { type ToastOptions } from "react-hot-toast";

// Default toast options
const defaultOptions: ToastOptions = {
    duration: 4000,
    position: "bottom-right",
};

// Main toast functions
export const showToast = {
    success: (message: string, options: ToastOptions = {}): string =>
        toast.success(message, { ...defaultOptions, ...options }),
    error: (message: string, options: ToastOptions = {}): string =>
        toast.error(message, { ...defaultOptions, ...options }),
    warning: (message: string, options: ToastOptions = {}): string =>
        toast(message, { icon: "⚠️", ...defaultOptions, ...options }),
    info: (message: string, options: ToastOptions = {}): string =>
        toast(message, { icon: "ℹ️", ...defaultOptions, ...options }),
    loading: (message: string, options: ToastOptions = {}): string =>
        toast.loading(message, { ...defaultOptions, ...options }),
    promise: <T>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        },
        options: ToastOptions = {}
    ): Promise<T> =>
        toast.promise(promise, messages, { ...defaultOptions, ...options }),
    dismiss: (toastId?: string): void => toast.dismiss(toastId),
    dismissAll: (): void => toast.dismiss(),
};

// Validation toast helpers
export const validationToast = {
    required: (field: string) => showToast.warning(`${field} is required`),
    invalid: (field: string) =>
        showToast.warning(`Please enter a valid ${field}`),
    mismatch: (field1: string, field2: string) =>
        showToast.error(`${field1} and ${field2} do not match`),
    minLength: (field: string, length: number) =>
        showToast.warning(`${field} must be at least ${length} characters`),
    maxLength: (field: string, length: number) =>
        showToast.warning(`${field} cannot exceed ${length} characters`),
    email: () => showToast.warning("Please enter a valid email address"),
    phone: () => showToast.warning("Please enter a valid phone number"),
    terms: () =>
        showToast.warning("You must agree to the terms and conditions"),
};

// Auth toast helpers
export const authToast = {
    loginSuccess: () =>
        showToast.success("Welcome back! Redirecting...", { duration: 2000 }),
    loginError: (message?: string) =>
        showToast.error(message || "Login failed. Please try again."),
    signupSuccess: () =>
        showToast.success("Account created successfully! Welcome aboard!", {
            duration: 3000,
        }),
    signupError: (message?: string) =>
        showToast.error(message || "Failed to create account"),
    authenticating: () => showToast.loading("Authenticating..."),
    creatingAccount: () => showToast.loading("Creating your account..."),
    logoutSuccess: () =>
        showToast.success("Logged out successfully", { duration: 2000 }),
    sessionExpired: () =>
        showToast.warning("Your session has expired. Please login again.", {
            duration: 5000,
        }),
    connectionError: () =>
        showToast.error(
            "Connection error. Please check your internet and try again.",
            { duration: 6000 }
        ),
    passwordResetSent: () =>
        showToast.success("Password reset email sent! Check your inbox.", {
            duration: 5000,
        }),
    passwordResetError: () =>
        showToast.error(
            "Failed to send password reset email. Please try again."
        ),
    emailVerificationSent: () =>
        showToast.success("Verification email sent! Please check your inbox.", {
            duration: 5000,
        }),
};

// App action toast helpers
export const appToast = {
    saveSuccess: (item: string = "Data") =>
        showToast.success(`${item} saved successfully!`),
    saveError: (item: string = "Data") =>
        showToast.error(`Failed to save ${item.toLowerCase()}`),
    deleteSuccess: (item: string = "Item") =>
        showToast.success(`${item} deleted successfully!`),
    deleteError: (item: string = "Item") =>
        showToast.error(`Failed to delete ${item.toLowerCase()}`),
    updateSuccess: (item: string = "Data") =>
        showToast.success(`${item} updated successfully!`),
    updateError: (item: string = "Data") =>
        showToast.error(`Failed to update ${item.toLowerCase()}`),
    uploadSuccess: (item: string = "File") =>
        showToast.success(`${item} uploaded successfully!`),
    uploadError: (item: string = "File") =>
        showToast.error(`Failed to upload ${item.toLowerCase()}`),
    copySuccess: (item: string = "Content") =>
        showToast.success(`${item} copied to clipboard!`, { duration: 2000 }),
    copyError: () => showToast.error("Failed to copy to clipboard"),
    networkError: () =>
        showToast.error("Network error. Please check your connection.", {
            duration: 5000,
        }),
    permissionDenied: () =>
        showToast.error("You don't have permission to perform this action"),
    comingSoon: () =>
        showToast.info("This feature is coming soon!", { duration: 3000 }),
};

export { toast };
export default showToast;

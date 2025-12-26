// src/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { showToast } from "@/lib/toast"; // Assuming this path
import Link from "next/link";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthForm } from "@/hooks/useAuthForm"; // Import the new hook

export const LoginForm = () => {
    const { formData, handleInputChange } = useAuthForm({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const { login, loading } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        if (!formData.email || !formData.password) {
            showToast.error("Please enter both email and password.");
            return;
        }
        try {
            // This now correctly uses the context's login function, which handles the redirect.
            await login(formData.email, formData.password);
            // The success toast is already handled in the AuthContext, so we can remove it from here.
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Login failed";
            showToast.error(errorMessage);
        }
    };

    return (
        <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="bg-white/80 dark:bg-dark-background/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-light-secondary dark:border-dark-secondary p-6 sm:p-8 md:p-10">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-dark to-primary-main bg-clip-text text-transparent mb-2">
                        Login to Reflectify
                    </h1>
                    <p className="text-secondary-dark dark:text-dark-tertiary text-sm sm:text-base">
                        Sign in to your account
                    </p>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 sm:space-y-6"
                >
                    <div className="space-y-2">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-secondary-dark dark:text-dark-text block"
                        >
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3.5 bg-white dark:bg-dark-secondary border border-secondary-lighter dark:border-dark-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-dark/50 focus:border-primary-dark dark:focus:ring-primary-main/50 dark:focus:border-primary-main transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-secondary-dark dark:text-dark-text block"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3.5 bg-white dark:bg-dark-secondary border border-secondary-lighter dark:border-dark-secondary rounded-xl pr-12 focus:outline-none focus:ring-2 focus:ring-primary-dark/50 focus:border-primary-dark dark:focus:ring-primary-main/50 dark:focus:border-primary-main transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                                placeholder="Enter your password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-main dark:text-dark-tertiary hover:text-secondary-dark dark:hover:text-dark-text transition-colors p-1"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <RiEyeOffLine size={20} />
                                ) : (
                                    <RiEyeLine size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 sm:py-4 bg-gradient-to-r from-primary-dark to-primary-main text-white rounded-xl text-lg font-semibold transition-all hover:from-primary-main hover:to-primary-darker focus:ring-2 focus:ring-primary-dark/50 shadow-lg shadow-primary-dark/30 dark:shadow-primary-main/20 flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader size="sm" color="text-white" />
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </motion.button>

                    <p className="text-center text-sm text-secondary-dark dark:text-dark-tertiary">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="text-primary-dark dark:text-primary-light hover:underline font-medium transition-colors"
                        >
                            Register
                        </Link>
                    </p>
                </form>
            </div>
        </motion.div>
    );
};

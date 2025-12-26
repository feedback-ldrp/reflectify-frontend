// src/components/ui/Input.tsx
"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const inputVariants = cva(
    "flex w-full rounded-lg border bg-white dark:bg-dark-secondary transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-main dark:placeholder:text-dark-tertiary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "border-secondary-lighter dark:border-dark-secondary focus:ring-2 focus:ring-primary-dark/50 focus:border-primary-dark dark:focus:border-primary-light",
                error: "border-negative-light dark:border-negative-dark focus:ring-2 focus:ring-negative-main/50 focus:border-negative-main",
                success:
                    "border-positive-light dark:border-positive-dark focus:ring-2 focus:ring-positive-main/50 focus:border-positive-main",
            },
            size: {
                default: "h-10 px-3 py-2 text-sm",
                sm: "h-8 px-2 py-1 text-xs",
                lg: "h-12 px-4 py-3 text-base",
                xl: "h-14 px-4 py-3.5 text-lg",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
        VariantProps<typeof inputVariants> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    showPasswordToggle?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            variant,
            size,
            type,
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            showPasswordToggle = false,
            id,
            ...props
        },
        ref
    ) => {
        const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
        const [inputType, setInputType] = React.useState(type);

        // Generate unique ID if not provided
        const uniqueId = React.useId();
        const inputId = id || `input-${uniqueId}`;

        // Handle password visibility toggle
        React.useEffect(() => {
            if (showPasswordToggle && type === "password") {
                setInputType(isPasswordVisible ? "text" : "password");
            }
        }, [isPasswordVisible, showPasswordToggle, type]);

        const inputVariant = error ? "error" : variant;

        return (
            <div className="space-y-1">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-xs sm:text-sm font-medium text-secondary-dark dark:text-dark-text block"
                    >
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-main dark:text-dark-tertiary">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        type={inputType}
                        className={cn(
                            inputVariants({
                                variant: inputVariant,
                                size,
                                className,
                            }),
                            leftIcon && "pl-10",
                            (rightIcon || showPasswordToggle) && "pr-10"
                        )}
                        ref={ref}
                        id={inputId}
                        {...props}
                    />

                    {(rightIcon ||
                        (showPasswordToggle && type === "password")) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {showPasswordToggle && type === "password" ? (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsPasswordVisible(!isPasswordVisible)
                                    }
                                    className="text-secondary-main dark:text-dark-tertiary hover:text-secondary-dark dark:hover:text-dark-text transition-colors focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {isPasswordVisible ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            ) : (
                                rightIcon
                            )}
                        </div>
                    )}
                </div>

                {(error || helperText) && (
                    <p
                        className={cn(
                            "text-xs",
                            error
                                ? "text-negative-main dark:text-negative-light"
                                : "text-secondary-main dark:text-dark-tertiary"
                        )}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input, inputVariants };

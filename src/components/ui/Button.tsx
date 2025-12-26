// src/components/ui/Button.tsx
"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]",
    {
        variants: {
            variant: {
                default:
                    "bg-light-highlight dark:bg-dark-highlight text-light-text dark:text-dark-text hover:bg-primary-dark",
                destructive:
                    "bg-negative-main text-white hover:bg-negative-dark focus:ring-negative-main/50 text-md",
                outline:
                    "border border-primary-main text-light-highlight dark:text-dark-highlight bg-transparent hover:bg-light-highlight dark:bg-dark-highlight hover:text-white focus:ring-primary-main/50",
                secondary:
                    "bg-secondary-lighter text-secondary-darker hover:bg-secondary-light dark:bg-dark-secondary dark:text-dark-text dark:hover:bg-dark-hover focus:ring-secondary-main/50",
                ghost: "text-secondary-darker hover:bg-secondary-lighter dark:text-dark-text dark:hover:bg-dark-hover focus:ring-secondary-main/50",
                link: "text-light-highlight dark:text-dark-highlight underline-offset-4 hover:underline focus:ring-primary-main/50",
                gradient:
                    "bg-gradient-to-r from-primary-dark to-primary-main text-white hover:from-primary-darker hover:to-primary-dark focus:ring-primary-dark/50",
            },
            size: {
                default: "h-10 px-4 py-2 text-sm",
                sm: "h-8 px-3 py-1.5 text-xs",
                lg: "h-12 px-6 py-3 text-base",
                xl: "h-14 px-8 py-4 text-lg",
                icon: "h-10 w-10 p-0",
                "icon-sm": "h-8 w-8 p-0",
                "icon-lg": "h-12 w-12 p-0",
            },
            fullWidth: {
                true: "w-full",
                false: "w-auto",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            fullWidth: false,
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            fullWidth,
            loading = false,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <button
                className={cn(
                    buttonVariants({ variant, size, fullWidth, className })
                )}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                )}
                {!loading && leftIcon && leftIcon}
                {children}
                {!loading && rightIcon && rightIcon}
            </button>
        );
    }
);

Button.displayName = "Button";

export { Button, buttonVariants };

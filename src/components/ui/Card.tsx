// src/components/ui/Card.tsx
"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-lg border transition-colors", {
    variants: {
        variant: {
            default:
                "bg-light-background border-secondary-lighter dark:bg-dark-background dark:border-dark-secondary",
            elevated:
                "bg-light-background border-secondary-lighter shadow-md dark:bg-dark-background dark:border-dark-secondary dark:shadow-lg",
            outlined:
                "bg-transparent border-2 border-secondary-light dark:border-dark-secondary",
            ghost: "bg-transparent border-transparent hover:bg-secondary-lighter dark:hover:bg-dark-hover",
            gradient:
                "bg-gradient-to-br from-primary-lighter to-light-background border-primary-light dark:from-dark-background dark:to-dark-secondary dark:border-primary-darker",
        },
        padding: {
            none: "p-0",
            sm: "p-3",
            default: "p-4",
            lg: "p-6",
            xl: "p-8",
        },
    },
    defaultVariants: {
        variant: "default",
        padding: "default",
    },
});

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof cardVariants> {}

function Card({ className, variant, padding, ...props }: CardProps) {
    return (
        <div
            className={cn(cardVariants({ variant, padding }), className)}
            {...props}
        />
    );
}

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "text-xl font-semibold leading-none tracking-tight text-secondary-darker dark:text-dark-text",
            className
        )}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn(
            "text-sm text-secondary-main dark:text-dark-tertiary",
            className
        )}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

export {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardDescription,
    CardContent,
    cardVariants,
};

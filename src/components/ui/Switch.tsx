/**
 * @file src/components/ui/Switch.tsx
 * @description Toggle switch component with labels and flexible styling
 */

"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Switch size variants
export type SwitchSize = "sm" | "md" | "lg";

// Switch props
export interface SwitchProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
    /** Label text */
    label?: string;
    /** Description text below the label */
    description?: string;
    /** Size variant */
    size?: SwitchSize;
    /** Error state */
    error?: boolean;
    /** Error message */
    errorMessage?: string;
    /** Label position */
    labelPosition?: "left" | "right";
    /** Custom label class */
    labelClassName?: string;
    /** Show on/off text inside switch */
    showText?: boolean;
    /** Custom on text */
    onText?: string;
    /** Custom off text */
    offText?: string;
    /** Legacy prop for compatibility */
    onCheckedChange?: (checked: boolean) => void;
}

// Size variants
const sizeVariants: Record<
    SwitchSize,
    {
        track: string;
        thumb: string;
        label: string;
        description: string;
        translate: string;
        textSize: string;
    }
> = {
    sm: {
        track: "h-5 w-9",
        thumb: "h-4 w-4",
        label: "text-sm",
        description: "text-xs",
        translate: "translate-x-4",
        textSize: "text-xs",
    },
    md: {
        track: "h-6 w-11",
        thumb: "h-5 w-5",
        label: "text-base",
        description: "text-sm",
        translate: "translate-x-5",
        textSize: "text-xs",
    },
    lg: {
        track: "h-7 w-12",
        thumb: "h-6 w-6",
        label: "text-lg",
        description: "text-base",
        translate: "translate-x-5",
        textSize: "text-sm",
    },
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
    (
        {
            label,
            description,
            size = "md",
            error = false,
            errorMessage,
            labelPosition = "right",
            labelClassName,
            showText = false,
            onText = "ON",
            offText = "OFF",
            className,
            checked, // Controlled prop
            disabled,
            onChange, // Native onChange for the input
            onCheckedChange, // Custom prop for boolean change
            ...props
        },
        ref
    ) => {
        const sizeClasses = sizeVariants[size];

        // This handles the native input's onChange event
        const handleNativeInputChange = (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            // Call the original onChange if provided
            onChange?.(e);
            // Call the custom onCheckedChange with the new checked state
            onCheckedChange?.(e.target.checked);
        };

        // This handles clicks on the visual track, directly toggling the state
        const handleTrackClick = () => {
            if (!disabled && onCheckedChange !== undefined) {
                // Toggle the checked state and call onCheckedChange
                onCheckedChange(!checked);
            }
        };

        const switchElement = (
            <div className="relative">
                <input
                    ref={ref}
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={handleNativeInputChange} // Use the new handler
                    className={cn("peer sr-only", className)}
                    {...props}
                />

                {/* Track */}
                <div
                    onClick={handleTrackClick} // Direct click handler for the track
                    className={cn(
                        // Base track styles
                        "relative inline-flex items-center rounded-full transition-all duration-200",
                        sizeClasses.track,

                        // Default state
                        "bg-gray-300 dark:bg-gray-600",

                        // Checked state (for track background)
                        "peer-checked:bg-primary-600",

                        // Focus state
                        "peer-focus:ring-2 peer-focus:ring-primary-200 peer-focus:ring-offset-2",
                        "dark:peer-focus:ring-primary-800 dark:peer-focus:ring-offset-gray-900",

                        // Error state
                        error &&
                            "bg-red-300 peer-checked:bg-red-600 dark:bg-red-600 dark:peer-checked:bg-red-500",

                        // Disabled state
                        disabled && "cursor-not-allowed opacity-50",

                        // Interactive
                        !disabled && "cursor-pointer"
                    )}
                >
                    {/* Thumb */}
                    <div
                        className={cn(
                            // Base thumb styles
                            "absolute left-0.5 inline-block rounded-full bg-white shadow-sm transition-transform duration-200",
                            sizeClasses.thumb,

                            // Conditionally apply translate based on 'checked' prop
                            // This replaces peer-checked for thumb movement as thumb is not a direct sibling of peer input
                            checked ? sizeClasses.translate : "",

                            // Shadow and elevation
                            `shadow-md ring-0 ${
                                checked
                                    ? "bg-light-highlight dark:bg-dark-highlight"
                                    : ""
                            }`
                        )}
                    />

                    {/* Text labels inside track */}
                    {showText && (
                        <>
                            <span
                                className={cn(
                                    "absolute left-1 font-medium text-white transition-opacity duration-200",
                                    sizeClasses.textSize,
                                    checked ? "opacity-100" : "opacity-0"
                                )}
                            >
                                {onText}
                            </span>
                            <span
                                className={cn(
                                    "absolute right-1 font-medium text-gray-600 transition-opacity duration-200",
                                    sizeClasses.textSize,
                                    !checked ? "opacity-100" : "opacity-0"
                                )}
                            >
                                {offText}
                            </span>
                        </>
                    )}
                </div>
            </div>
        );

        const labelElement = label && (
            <div className="flex flex-col">
                <label
                    htmlFor={props.id}
                    className={cn(
                        "cursor-pointer select-none font-medium",
                        sizeClasses.label,
                        "text-gray-900 dark:text-gray-100",
                        disabled && "cursor-not-allowed opacity-50",
                        error && "text-red-600 dark:text-red-400",
                        labelClassName
                    )}
                >
                    {label}
                </label>
                {description && (
                    <span
                        className={cn(
                            "mt-1",
                            sizeClasses.description,
                            "text-gray-600 dark:text-gray-400",
                            disabled && "opacity-50",
                            error && "text-red-500 dark:text-red-400"
                        )}
                    >
                        {description}
                    </span>
                )}
            </div>
        );

        const content =
            labelPosition === "left"
                ? [labelElement, switchElement]
                : [switchElement, labelElement];

        return (
            <div className="flex flex-col">
                <div
                    className={cn(
                        "flex items-center gap-3",
                        labelPosition === "left" &&
                            "flex-row-reverse justify-between"
                    )}
                >
                    {content[0]}
                    {content[1]}
                </div>

                {error && errorMessage && (
                    <p
                        className={cn(
                            "mt-2 flex items-center gap-1",
                            sizeClasses.description,
                            "text-red-600 dark:text-red-400"
                        )}
                    >
                        <span>{errorMessage}</span>
                    </p>
                )}
            </div>
        );
    }
);

Switch.displayName = "Switch";

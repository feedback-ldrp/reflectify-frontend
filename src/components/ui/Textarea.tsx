/**
 * @file src/components/ui/Textarea.tsx
 * @description Flexible textarea component with resize options, character count, and validation
 */

"use client";

import React, { forwardRef, useState, useEffect } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

// Textarea size variants
export type TextareaSize = "sm" | "md" | "lg";

// Resize behavior options
export type TextareaResize =
  | "none"
  | "both"
  | "horizontal"
  | "vertical"
  | "auto";

// Textarea props
export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
  /** Label text */
  label?: string;
  /** Helper text below the textarea */
  helperText?: string;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Size variant */
  size?: TextareaSize;
  /** Resize behavior */
  resize?: TextareaResize;
  /** Show character count */
  showCharacterCount?: boolean;
  /** Maximum character count */
  maxLength?: number;
  /** Minimum rows */
  minRows?: number;
  /** Maximum rows (for auto-resize) */
  maxRows?: number;
  /** Custom label class */
  labelClassName?: string;
  /** Wrapper class */
  wrapperClassName?: string;
  /** Full width */
  fullWidth?: boolean;
}

// Size variants
const sizeVariants: Record<
  TextareaSize,
  {
    textarea: string;
    label: string;
    helper: string;
    padding: string;
    fontSize: string;
  }
> = {
  sm: {
    textarea: "min-h-[80px]",
    label: "text-sm",
    helper: "text-xs",
    padding: "px-3 py-2",
    fontSize: "text-sm",
  },
  md: {
    textarea: "min-h-[100px]",
    label: "text-base",
    helper: "text-sm",
    padding: "px-3 py-3",
    fontSize: "text-base",
  },
  lg: {
    textarea: "min-h-[120px]",
    label: "text-lg",
    helper: "text-base",
    padding: "px-4 py-3",
    fontSize: "text-lg",
  },
};

// Resize variant styles
const resizeVariants: Record<TextareaResize, string> = {
  none: "resize-none",
  both: "resize",
  horizontal: "resize-x",
  vertical: "resize-y",
  auto: "resize-none", // Auto-resize handled by JavaScript
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error = false,
      errorMessage,
      size = "md",
      resize = "vertical",
      showCharacterCount = false,
      maxLength,
      minRows = 3,
      maxRows,
      labelClassName,
      wrapperClassName,
      fullWidth = true,
      className,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState<string>(
      (value as string) || "",
    );
    const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(
      null,
    );

    // Use controlled or uncontrolled value
    const currentValue =
      value !== undefined ? (value as string) : internalValue;
    const characterCount = currentValue.length;

    const sizeClasses = sizeVariants[size];

    // Auto-resize functionality
    useEffect(() => {
      if (resize === "auto" && textareaRef) {
        const textarea = textareaRef;

        // Reset height to recalculate
        textarea.style.height = "auto";

        // Calculate new height
        const scrollHeight = textarea.scrollHeight;
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const paddingTop = parseInt(getComputedStyle(textarea).paddingTop);
        const paddingBottom = parseInt(
          getComputedStyle(textarea).paddingBottom,
        );

        const minHeight = minRows * lineHeight + paddingTop + paddingBottom;
        const maxHeight = maxRows
          ? maxRows * lineHeight + paddingTop + paddingBottom
          : Infinity;

        const newHeight = Math.min(
          Math.max(scrollHeight, minHeight),
          maxHeight,
        );

        textarea.style.height = `${newHeight}px`;
      }
    }, [currentValue, resize, minRows, maxRows, textareaRef]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;

      // Respect maxLength if provided
      if (maxLength && newValue.length > maxLength) {
        return;
      }

      if (value === undefined) {
        setInternalValue(newValue);
      }
      onChange?.(e);
    };

    const handleRef = (node: HTMLTextAreaElement | null) => {
      setTextareaRef(node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    return (
      <div className={cn("space-y-2", fullWidth && "w-full", wrapperClassName)}>
        {/* Label */}
        {label && (
          <label
            className={cn(
              "block font-medium",
              sizeClasses.label,
              "text-gray-900 dark:text-gray-100",
              error && "text-red-600 dark:text-red-400",
              labelClassName,
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Textarea wrapper */}
        <div className="relative">
          <textarea
            ref={handleRef}
            value={currentValue}
            onChange={handleChange}
            maxLength={maxLength}
            rows={resize !== "auto" ? minRows : undefined}
            className={cn(
              // Base styles
              "block w-full rounded-lg border border-gray-300 transition-all duration-200",
              "focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:ring-offset-2",
              "dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
              "dark:focus:border-primary-400 dark:focus:ring-primary-800 dark:focus:ring-offset-gray-900",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400",

              // Size variants
              sizeClasses.textarea,
              sizeClasses.padding,
              sizeClasses.fontSize,

              // Resize variants
              resizeVariants[resize],

              // Error state
              error && [
                "border-red-500 focus:border-red-500 focus:ring-red-200",
                "dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-800",
              ],

              // Disabled state
              props.disabled && [
                "cursor-not-allowed opacity-50 bg-gray-100",
                "dark:bg-gray-700",
              ],

              className,
            )}
            {...props}
          />

          {/* Error icon */}
          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-start pr-3 pt-3">
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Helper text, error message, and character count */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {error && errorMessage ? (
              <p
                className={cn(
                  "flex items-center gap-1",
                  sizeClasses.helper,
                  "text-red-600 dark:text-red-400",
                )}
              >
                <span>{errorMessage}</span>
              </p>
            ) : helperText ? (
              <p
                className={cn(
                  sizeClasses.helper,
                  "text-gray-600 dark:text-gray-400",
                )}
              >
                {helperText}
              </p>
            ) : null}
          </div>

          {/* Character count */}
          {showCharacterCount && (
            <p
              className={cn(
                sizeClasses.helper,
                "text-gray-500 dark:text-gray-400",
                maxLength &&
                  characterCount > maxLength * 0.9 &&
                  "text-orange-500",
                maxLength && characterCount >= maxLength && "text-red-500",
              )}
            >
              {maxLength ? `${characterCount}/${maxLength}` : characterCount}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;

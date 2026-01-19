/**
 * @file src/components/ui/Tooltip.tsx
 * @description Simple tooltip component for explaining complex terms to non-technical users
 */

"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-light-text dark:border-t-dark-text border-x-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-light-text dark:border-b-dark-text border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-light-text dark:border-l-dark-text border-y-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-light-text dark:border-r-dark-text border-y-transparent border-l-transparent",
  };

  return (
    <div
      className={cn("relative inline-flex items-center", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children || (
        <button
          type="button"
          className="text-light-muted-text dark:text-dark-muted-text hover:text-light-highlight dark:hover:text-dark-highlight transition-colors focus:outline-none focus:ring-2 focus:ring-primary-main/20 rounded-full"
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      )}

      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-2 text-xs font-medium text-white bg-light-text dark:bg-dark-text rounded-lg shadow-md whitespace-nowrap max-w-xs",
            positionClasses[position],
          )}
          role="tooltip"
        >
          {content}
          <div
            className={cn("absolute w-0 h-0 border-4", arrowClasses[position])}
          />
        </div>
      )}
    </div>
  );
}

/**
 * InfoLabel - A label with an optional help tooltip
 */
interface InfoLabelProps {
  label: string;
  helpText?: string;
  required?: boolean;
  className?: string;
}

export function InfoLabel({
  label,
  helpText,
  required,
  className,
}: InfoLabelProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="text-sm font-medium text-light-text dark:text-dark-text">
        {label}
        {required && <span className="text-negative-main ml-0.5">*</span>}
      </span>
      {helpText && <Tooltip content={helpText} />}
    </div>
  );
}

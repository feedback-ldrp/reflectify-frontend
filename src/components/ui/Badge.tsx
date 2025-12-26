/**
 * @file src/components/ui/Badge.tsx
 * @description Flexible badge/chip component with various styles and states
 */

"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-light-highlight/20 dark:bg-dark-highlight text-white hover:bg-primary-dark",
        secondary:
          "border-transparent bg-secondary-lighter text-secondary-dark hover:bg-secondary-light dark:bg-dark-secondary dark:text-dark-text dark:hover:bg-dark-hover",
        destructive:
          "border-transparent bg-negative-main text-white hover:bg-negative-dark",
        outline:
          "border-secondary-light text-secondary-dark dark:border-dark-secondary dark:text-dark-text",
        success:
          "border-transparent bg-positive-main text-white hover:bg-positive-dark",
        warning:
          "border-transparent bg-warning-main text-warning-darker hover:bg-warning-dark",
        info: "border-transparent bg-highlight1-main text-white hover:bg-highlight1-dark",
        purple:
          "border-transparent bg-highlight2-main text-white hover:bg-highlight2-dark",
      },
      size: {
        sm: "px-2 py-0.5 text-xs gap-1",
        default: "px-2.5 py-0.5 text-xs gap-1.5",
        lg: "px-3 py-1 text-sm gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Removable badge with close button */
  removable?: boolean;
  /** Close button handler */
  onRemove?: () => void;
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Right icon element to display */
  rightIcon?: React.ReactNode;
  /** Disable the badge */
  disabled?: boolean;
  /** Custom close icon */
  closeIcon?: React.ReactNode;
}

function Badge({
  className,
  variant,
  size,
  children,
  removable = false,
  onRemove,
  icon,
  rightIcon,
  disabled = false,
  closeIcon,
  ...props
}: BadgeProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  const sizeClasses = {
    sm: { icon: "h-3 w-3", close: "h-3 w-3" },
    default: { icon: "h-4 w-4", close: "h-4 w-4" },
    lg: { icon: "h-5 w-5", close: "h-5 w-5" },
  };

  const currentSize = size || "default";
  const iconClasses = sizeClasses[currentSize];

  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {/* Icon */}
      {icon && (
        <span className={cn(iconClasses.icon, "flex-shrink-0")}>{icon}</span>
      )}

      {/* Content */}
      {children && <span className="truncate">{children}</span>}

      {/* Right icon */}
      {rightIcon && (
        <span className={cn(iconClasses.icon, "flex-shrink-0")}>
          {rightIcon}
        </span>
      )}

      {/* Remove button */}
      {removable && !disabled && (
        <button
          type="button"
          onClick={handleRemove}
          className={cn(
            "flex-shrink-0 rounded-full p-0.5 transition-colors ml-1",
            "hover:bg-black/10 dark:hover:bg-white/10",
            "focus:outline-none focus:ring-1 focus:ring-current",
          )}
          aria-label="Remove badge"
        >
          {closeIcon ? (
            <span className={iconClasses.close}>{closeIcon}</span>
          ) : (
            <XMarkIcon className={iconClasses.close} />
          )}
        </button>
      )}
    </div>
  );
}

export { Badge, badgeVariants };

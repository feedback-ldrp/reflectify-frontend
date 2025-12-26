/**
 * @file src/components/ui/LoadingSpinner.tsx
 * @description Flexible loading spinner component with multiple variants and sizes
 */

"use client";

import React from "react";

// Loading spinner types
export type SpinnerVariant =
    | "default"
    | "dots"
    | "pulse"
    | "bars"
    | "circle"
    | "bounce";

// Spinner size options
export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";

// Loading spinner props
export interface LoadingSpinnerProps {
    variant?: SpinnerVariant;
    size?: SpinnerSize;
    color?: "primary" | "secondary" | "white" | "current";
    className?: string;
    text?: string;
    textPosition?: "right" | "bottom";
    fullScreen?: boolean;
    overlay?: boolean;
}

// Size configurations
const sizeConfig = {
    xs: { spinner: "w-3 h-3", text: "text-xs" },
    sm: { spinner: "w-4 h-4", text: "text-sm" },
    md: { spinner: "w-6 h-6", text: "text-base" },
    lg: { spinner: "w-8 h-8", text: "text-lg" },
    xl: { spinner: "w-12 h-12", text: "text-xl" },
};

// Color configurations
const colorConfig = {
    primary: "text-light-highlight dark:text-dark-highlight",
    secondary: "text-secondary-main",
    white: "text-white",
    current: "text-current",
};

// Default spinner (spinning circle)
const DefaultSpinner: React.FC<{ size: SpinnerSize; color: string }> = ({
    size,
    color,
}) => (
    <div
        className={`
      ${sizeConfig[size].spinner} 
      ${color}
      animate-spin rounded-full border-2 border-current border-t-transparent
    `}
    />
);

// Dots spinner
const DotsSpinner: React.FC<{ size: SpinnerSize; color: string }> = ({
    size,
    color,
}) => {
    const dotSize =
        size === "xs"
            ? "w-1 h-1"
            : size === "sm"
            ? "w-1.5 h-1.5"
            : size === "md"
            ? "w-2 h-2"
            : size === "lg"
            ? "w-2.5 h-2.5"
            : "w-3 h-3";

    return (
        <div className="flex space-x-1">
            <div
                className={`${dotSize} ${color} bg-current rounded-full animate-bounce [animation-delay:0ms]`}
            />
            <div
                className={`${dotSize} ${color} bg-current rounded-full animate-bounce [animation-delay:150ms]`}
            />
            <div
                className={`${dotSize} ${color} bg-current rounded-full animate-bounce [animation-delay:300ms]`}
            />
        </div>
    );
};

// Pulse spinner
const PulseSpinner: React.FC<{ size: SpinnerSize; color: string }> = ({
    size,
    color,
}) => (
    <div
        className={`
      ${sizeConfig[size].spinner}
      ${color}
      bg-light-background dark:bg-dark-background rounded-full animate-pulse
    `}
    />
);

// Bars spinner
const BarsSpinner: React.FC<{ size: SpinnerSize; color: string }> = ({
    size,
    color,
}) => {
    const barHeight =
        size === "xs"
            ? "h-2"
            : size === "sm"
            ? "h-3"
            : size === "md"
            ? "h-4"
            : size === "lg"
            ? "h-5"
            : "h-6";
    const barWidth = size === "xs" ? "w-0.5" : size === "sm" ? "w-0.5" : "w-1";

    return (
        <div className="flex space-x-1 items-end">
            <div
                className={`${barWidth} ${barHeight} ${color} bg-current animate-pulse [animation-delay:0ms] [animation-duration:1s]`}
            />
            <div
                className={`${barWidth} ${barHeight} ${color} bg-current animate-pulse [animation-delay:100ms] [animation-duration:1s]`}
            />
            <div
                className={`${barWidth} ${barHeight} ${color} bg-current animate-pulse [animation-delay:200ms] [animation-duration:1s]`}
            />
        </div>
    );
};

// Circle spinner
const CircleSpinner: React.FC<{ size: SpinnerSize; color: string }> = ({
    size,
    color,
}) => {
    const circleSize = sizeConfig[size].spinner;

    return (
        <div className={`${circleSize} relative`}>
            <div
                className={`
          ${circleSize} 
          ${color}
          border-2 border-current rounded-full opacity-25
        `}
            />
            <div
                className={`
          ${circleSize}
          ${color}
          border-2 border-current border-t-transparent rounded-full animate-spin
          absolute top-0 left-0
        `}
            />
        </div>
    );
};

// Bounce spinner
const BounceSpinner: React.FC<{ size: SpinnerSize; color: string }> = ({
    size,
    color,
}) => {
    const ballSize =
        size === "xs"
            ? "w-2 h-2"
            : size === "sm"
            ? "w-2.5 h-2.5"
            : size === "md"
            ? "w-3 h-3"
            : size === "lg"
            ? "w-4 h-4"
            : "w-5 h-5";

    return (
        <div className="flex space-x-1">
            <div
                className={`${ballSize} ${color} bg-current rounded-full animate-bounce [animation-duration:1.4s] [animation-timing-function:ease-in-out] [animation-iteration-count:infinite] [animation-delay:0s]`}
            />
            <div
                className={`${ballSize} ${color} bg-current rounded-full animate-bounce [animation-duration:1.4s] [animation-timing-function:ease-in-out] [animation-iteration-count:infinite] [animation-delay:0.16s]`}
            />
        </div>
    );
};

// Main LoadingSpinner component
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    variant = "default",
    size = "md",
    color = "primary",
    className = "bg-light-background dark:bg-dark-background",
    text,
    textPosition = "right",
    fullScreen = false,
    overlay = false,
}) => {
    const colorClass = colorConfig[color];

    // Render the appropriate spinner variant
    const renderSpinner = () => {
        switch (variant) {
            case "dots":
                return <DotsSpinner size={size} color={colorClass} />;
            case "pulse":
                return <PulseSpinner size={size} color={colorClass} />;
            case "bars":
                return <BarsSpinner size={size} color={colorClass} />;
            case "circle":
                return <CircleSpinner size={size} color={colorClass} />;
            case "bounce":
                return <BounceSpinner size={size} color={colorClass} />;
            default:
                return <DefaultSpinner size={size} color={colorClass} />;
        }
    };

    // Spinner content
    const spinnerContent = (
        <div
            className={`
        flex items-center gap-2
        ${textPosition === "bottom" ? "flex-col" : "flex-row"}
        ${className}
      `}
        >
            {renderSpinner()}
            {text && (
                <span
                    className={`
            ${sizeConfig[size].text}
            ${colorClass}
            font-medium
          `}
                >
                    {text}
                </span>
            )}
        </div>
    );

    // Full screen loader
    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-light-background dark:bg-dark-background">
                {spinnerContent}
            </div>
        );
    }

    // Overlay loader
    if (overlay) {
        return (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-light-background/50 dark:bg-dark-background/50 backdrop-blur-sm">
                {spinnerContent}
            </div>
        );
    }

    // Regular loader
    return spinnerContent;
};

// Preset spinner components for common use cases
export const PageLoader: React.FC<Omit<LoadingSpinnerProps, "fullScreen">> = (
    props
) => <LoadingSpinner fullScreen text="Loading..." variant="dots" {...props} />;

export const ButtonLoader: React.FC<
    Omit<LoadingSpinnerProps, "size" | "color">
> = (props) => (
    <LoadingSpinner size="sm" color="current" variant="dots" {...props} />
);

export const TableLoader: React.FC<Omit<LoadingSpinnerProps, "overlay">> = (
    props
) => (
    <LoadingSpinner overlay text="Loading data..." variant="dots" {...props} />
);

export const InlineLoader: React.FC<
    Omit<LoadingSpinnerProps, "fullScreen" | "overlay">
> = (props) => <LoadingSpinner size="sm" variant="dots" {...props} />;

// CSS animations for custom variants (to be added to global CSS)
export const spinnerAnimations = `
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }
`;

export default LoadingSpinner;

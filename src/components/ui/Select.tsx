// src/components/ui/Select.tsx
"use client";
import React from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid"; // Using a solid icon for better visibility

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    id: string;
    name: string;
    children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
    label,
    id,
    name,
    children,
    ...props
}) => {
    return (
        <div className="space-y-1">
            {label && (
                <label
                    htmlFor={id}
                    className="block text-sm font-medium text-light-text dark:text-dark-text"
                >
                    {label}
                </label>
            )}
            {/* Added a relative container to position the custom arrow */}
            <div className="relative">
                <select
                    id={id}
                    name={name}
                    className="block w-full px-3 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg shadow-sm
                               bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text
                               focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-primary-main
                               sm:text-sm transition-colors appearance-none pr-10"
                    {...props}
                >
                    {children}
                </select>
                {/* Custom arrow icon positioned absolutely */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDownIcon
                        className="h-6 w-6 text-light-text dark:text-dark-text"
                        aria-hidden="true"
                    />
                </div>
            </div>
        </div>
    );
};

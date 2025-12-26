// src/components/ui/Tabs.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
    value: string;
    onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabsContext = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error("Tabs components must be used within a Tabs provider");
    }
    return context;
};

interface TabsProps {
    value: string;
    onValueChange: (value: string) => void;
    children: ReactNode;
    className?: string;
}

const Tabs: React.FC<TabsProps> = ({
    value,
    onValueChange,
    children,
    className,
}) => {
    return (
        <TabsContext.Provider value={{ value, onValueChange }}>
            <div className={cn("space-y-4", className)}>{children}</div>
        </TabsContext.Provider>
    );
};

interface TabsListProps {
    children: ReactNode;
    className?: string;
}

const TabsList: React.FC<TabsListProps> = ({ children, className }) => {
    return (
        <div
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-xl p-1",
                className
            )}
        >
            {children}
        </div>
    );
};

interface TabsTriggerProps {
    value: string;
    children: ReactNode;
    className?: string;
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({
    value,
    children,
    className,
}) => {
    const { value: activeValue, onValueChange } = useTabsContext();
    const isActive = activeValue === value;

    return (
        <button
            onClick={() => onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                isActive
                    ? "bg-light-secondary dark:bg-dark-secondary shadow-sm text-light-highlight dark:text-dark-highlight"
                    : "text-light-muted-text dark:text-dark-muted-text hover:text-light-text dark:hover:text-dark-text hover:bg-light-background/50 dark:hover:bg-dark-background/50",
                className
            )}
            data-state={isActive ? "active" : "inactive"}
        >
            {children}
        </button>
    );
};

interface TabsContentProps {
    value: string;
    children: ReactNode;
    className?: string;
}

const TabsContent: React.FC<TabsContentProps> = ({
    value,
    children,
    className,
}) => {
    const { value: activeValue } = useTabsContext();
    const isActive = activeValue === value;

    if (!isActive) return null;

    return (
        <div
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
            data-state={isActive ? "active" : "inactive"}
        >
            {children}
        </div>
    );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };

/**
 * @file src/components/ui/Label.tsx
 * @description Simple label component
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <label
      className={cn(
        "text-sm font-medium text-light-text dark:text-dark-text",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
};

"use client";

import React, { useEffect, useRef } from "react";
import { X, Download, FileSpreadsheet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";

interface DrillDownPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  onExportCSV?: () => void;
  onExportExcel?: () => void;
}

const widthClasses = {
  sm: "w-[400px] max-w-[90vw]",
  md: "w-[600px] max-w-[90vw]",
  lg: "w-[800px] max-w-[90vw]",
  xl: "w-[1000px] max-w-[90vw]",
};

export const DrillDownPanel: React.FC<DrillDownPanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "lg",
  isLoading = false,
  onExportCSV,
  onExportExcel,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        isOpen
      ) {
        onClose();
      }
    };

    // Delay adding the listener to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-0 right-0 h-full z-50 bg-white shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col",
          widthClasses[width],
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h2
                id="panel-title"
                className="text-lg font-semibold text-gray-900 truncate"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 truncate">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Export buttons */}
              {(onExportCSV || onExportExcel) && !isLoading && (
                <div className="flex items-center gap-1 mr-2">
                  {onExportCSV && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onExportCSV}
                      className="h-8 px-2"
                      title="Export to CSV"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      CSV
                    </Button>
                  )}
                  {onExportExcel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onExportExcel}
                      className="h-8 px-2"
                      title="Export to Excel"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-1" />
                      Excel
                    </Button>
                  )}
                </div>
              )}
              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Close panel"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <DrillDownPanelSkeleton />
          ) : (
            children
          )}
        </div>
      </div>
    </>
  );
};

// Loading skeleton for the panel content
const DrillDownPanelSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-gray-50 rounded-lg">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Section */}
      <div>
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Another section */}
      <div>
        <Skeleton className="h-5 w-40 mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Section component for organizing drill-down content
interface DrillDownSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const DrillDownSection: React.FC<DrillDownSectionProps> = ({
  title,
  icon,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <svg
          className={cn(
            "w-5 h-5 text-gray-500 transition-transform",
            isOpen ? "rotate-180" : ""
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && <div className="p-4">{children}</div>}
    </div>
  );
};

// Stats card for displaying key metrics
interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  colorClass = "bg-blue-50 text-blue-700",
}) => {
  return (
    <div className={cn("p-4 rounded-lg", colorClass)}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {subtext && <p className="text-xs mt-1 opacity-70">{subtext}</p>}
    </div>
  );
};

// Rating badge component
interface RatingBadgeProps {
  rating: number | null;
  size?: "sm" | "md" | "lg";
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  size = "md",
}) => {
  if (rating === null) {
    return <span className="text-gray-400 text-sm">N/A</span>;
  }

  const getColorClass = (r: number) => {
    if (r >= 8) return "bg-green-100 text-green-800";
    if (r >= 6) return "bg-yellow-100 text-yellow-800";
    if (r >= 4) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full",
        getColorClass(rating),
        sizeClasses[size]
      )}
    >
      {rating.toFixed(2)}
    </span>
  );
};

export default DrillDownPanel;

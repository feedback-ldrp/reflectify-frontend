"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, FileSpreadsheet, FileText, GripVertical, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

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
  resizable?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  /** If true, renders as inline flex panel instead of modal overlay */
  inline?: boolean;
}

const widthClasses = {
  sm: 400,
  md: 500,
  lg: 600,
  xl: 800,
};

export const DrillDownPanel: React.FC<DrillDownPanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = "md",
  isLoading = false,
  onExportCSV,
  onExportExcel,
  resizable = true,
  defaultWidth,
  minWidth = 320,
  maxWidth = 900,
  inline = false,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState(defaultWidth || widthClasses[width]);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Reset width when panel opens with a new default
  useEffect(() => {
    if (isOpen && defaultWidth) {
      setPanelWidth(defaultWidth);
    } else if (isOpen && !defaultWidth) {
      setPanelWidth(widthClasses[width]);
    }
    // Expand when opening
    if (isOpen) {
      setIsCollapsed(false);
    }
  }, [isOpen, defaultWidth, width]);

  // Handle resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
  }, [panelWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      // Calculate new width (resize from left edge, so subtract delta)
      const delta = startXRef.current - e.clientX;
      const newWidth = Math.min(
        Math.max(startWidthRef.current + delta, minWidth),
        Math.min(maxWidth, window.innerWidth * 0.6)
      );
      
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, minWidth, maxWidth]);

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

  // For modal mode: Handle click outside
  useEffect(() => {
    if (inline) return; // Skip for inline mode
    
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        isOpen &&
        !isResizing
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
  }, [isOpen, onClose, isResizing, inline]);

  // For modal mode: Prevent body scroll when panel is open
  useEffect(() => {
    if (inline) return; // Skip for inline mode
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, inline]);

  // ============ INLINE MODE ============
  if (inline) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: isCollapsed ? 48 : panelWidth, 
              opacity: 1 
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "relative h-full flex-shrink-0",
              "bg-light-background dark:bg-dark-muted-background",
              "border-l border-light-secondary dark:border-dark-secondary",
              "flex flex-col overflow-hidden"
            )}
          >
            {/* Resize Handle */}
            {resizable && !isCollapsed && (
              <div
                onMouseDown={handleMouseDown}
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize group z-10",
                  "hover:bg-primary-main/30 transition-colors",
                  isResizing && "bg-primary-main/50"
                )}
              >
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-4 h-10 -ml-2",
                  "flex items-center justify-center rounded-l-md",
                  "bg-light-secondary dark:bg-dark-secondary",
                  "border border-r-0 border-light-tertiary dark:border-dark-tertiary",
                  "opacity-0 group-hover:opacity-100 transition-opacity",
                  isResizing && "opacity-100"
                )}>
                  <GripVertical className="w-3 h-3 text-light-muted-text dark:text-dark-muted-text" />
                </div>
              </div>
            )}

            {/* Collapsed State */}
            {isCollapsed ? (
              <div className="flex flex-col items-center py-4 h-full">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="p-2 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors mb-4"
                  title="Expand panel"
                >
                  <ChevronRight className="w-5 h-5 text-light-muted-text dark:text-dark-muted-text rotate-180" />
                </button>
                <div className="flex-1 flex items-center justify-center">
                  <span 
                    className="text-xs font-medium text-light-muted-text dark:text-dark-muted-text whitespace-nowrap origin-center"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    {title}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors mt-4"
                  title="Close panel"
                >
                  <X className="w-4 h-4 text-light-muted-text dark:text-dark-muted-text" />
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex-shrink-0 border-b border-light-secondary dark:border-dark-secondary bg-light-muted-background dark:bg-dark-noisy-background px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-semibold text-light-text dark:text-dark-text truncate">
                        {title}
                      </h2>
                      {subtitle && (
                        <p className="text-xs text-light-muted-text dark:text-dark-muted-text truncate mt-0.5">
                          {subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Export buttons */}
                      {(onExportCSV || onExportExcel) && !isLoading && (
                        <>
                          {onExportCSV && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={onExportCSV}
                              className="h-7 px-2"
                              title="Export to CSV"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onExportExcel && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={onExportExcel}
                              className="h-7 px-2"
                              title="Export to Excel"
                            >
                              <FileSpreadsheet className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </>
                      )}
                      {/* Collapse button */}
                      <button
                        onClick={() => setIsCollapsed(true)}
                        className="p-1.5 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors"
                        title="Collapse panel"
                      >
                        <ChevronRight className="w-4 h-4 text-light-muted-text dark:text-dark-muted-text" />
                      </button>
                      {/* Close button */}
                      <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors"
                        title="Close panel"
                      >
                        <X className="w-4 h-4 text-light-muted-text dark:text-dark-muted-text" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {isLoading ? <DrillDownPanelSkeleton /> : children}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ============ MODAL MODE (Original) ============
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
        style={{ width: `${panelWidth}px` }}
        className={cn(
          "fixed top-0 right-0 h-full z-50",
          "bg-light-background dark:bg-dark-muted-background shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col max-w-[90vw]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Resize Handle */}
        {resizable && (
          <div
            onMouseDown={handleMouseDown}
            className={cn(
              "absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize group z-10",
              "hover:bg-primary-main/20 transition-colors",
              isResizing && "bg-primary-main/30"
            )}
          >
            <div className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 w-4 h-12 -ml-1.5",
              "flex items-center justify-center rounded-l-md",
              "bg-light-secondary dark:bg-dark-secondary",
              "border border-r-0 border-light-tertiary dark:border-dark-tertiary",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              isResizing && "opacity-100"
            )}>
              <GripVertical className="w-3 h-3 text-light-muted-text dark:text-dark-muted-text" />
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex-shrink-0 border-b border-light-secondary dark:border-dark-secondary bg-light-muted-background dark:bg-dark-noisy-background px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <h2
                id="panel-title"
                className="text-lg font-semibold text-light-text dark:text-dark-text truncate"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="mt-1 text-sm text-light-muted-text dark:text-dark-muted-text truncate">{subtitle}</p>
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
                className="p-2 rounded-full hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors"
                aria-label="Close panel"
              >
                <X className="h-5 w-5 text-light-muted-text dark:text-dark-muted-text" />
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
    <div className="border border-light-secondary dark:border-dark-secondary rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-light-muted-background dark:bg-dark-noisy-background hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-light-muted-text dark:text-dark-muted-text">{icon}</span>}
          <span className="font-medium text-light-text dark:text-dark-text">{title}</span>
        </div>
        <svg
          className={cn(
            "w-5 h-5 text-light-muted-text dark:text-dark-muted-text transition-transform",
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
  colorClass = "bg-primary-lighter dark:bg-primary-bgDark text-primary-main",
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

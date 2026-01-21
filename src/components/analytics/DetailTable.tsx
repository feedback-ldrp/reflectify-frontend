"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { RatingBadge } from "./DrillDownPanel";

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: any, row: T) => React.ReactNode;
}

interface DetailTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  striped?: boolean;
  compact?: boolean;
  className?: string;
}

type SortDirection = "asc" | "desc" | null;

export function DetailTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  emptyMessage = "No data available",
  striped = true,
  compact = false,
  className,
}: DetailTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortColumn);
      const bValue = getNestedValue(b, sortColumn);

      // Handle null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === "asc" ? 1 : -1;
      if (bValue == null) return sortDirection === "asc" ? -1 : 1;

      // Compare values
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortColumn, sortDirection]);

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  "font-medium text-gray-600",
                  compact ? "px-3 py-2" : "px-4 py-3",
                  column.align === "right" && "text-right",
                  column.align === "center" && "text-center",
                  column.sortable && "cursor-pointer select-none hover:bg-gray-100",
                  column.width
                )}
                style={column.width ? { width: column.width } : undefined}
                onClick={
                  column.sortable
                    ? () => handleSort(String(column.key))
                    : undefined
                }
              >
                <div
                  className={cn(
                    "flex items-center gap-1",
                    column.align === "right" && "justify-end",
                    column.align === "center" && "justify-center"
                  )}
                >
                  <span>{column.header}</span>
                  {column.sortable && (
                    <span className="w-4 h-4">
                      {sortColumn === String(column.key) ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : sortDirection === "desc" ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                        )
                      ) : (
                        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "border-b border-gray-100 transition-colors",
                striped && rowIndex % 2 === 1 && "bg-gray-50/50",
                onRowClick &&
                  "cursor-pointer hover:bg-blue-50 hover:border-blue-100"
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((column) => {
                const value = getNestedValue(row, String(column.key));
                return (
                  <td
                    key={String(column.key)}
                    className={cn(
                      "text-gray-900",
                      compact ? "px-3 py-2" : "px-4 py-3",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center"
                    )}
                  >
                    {column.render ? column.render(value, row) : formatValue(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper function to get nested value from object
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

// Helper function to format values
function formatValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">-</span>;
  }
  if (typeof value === "number") {
    return value.toLocaleString();
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return String(value);
}

// Pre-built column renderers for common use cases

export const columnRenderers = {
  // Rating column with color coding
  rating: (value: number | null) => <RatingBadge rating={value} size="sm" />,

  // Percentage with color coding
  percentage: (value: number | null) => {
    if (value === null) return <span className="text-gray-400">-</span>;
    const colorClass =
      value >= 75
        ? "text-green-600"
        : value >= 50
        ? "text-yellow-600"
        : "text-red-600";
    return <span className={colorClass}>{value.toFixed(1)}%</span>;
  },

  // Badge for lecture type
  lectureType: (value: "LECTURE" | "LAB") => (
    <span
      className={cn(
        "inline-flex px-2 py-0.5 text-xs font-medium rounded-full",
        value === "LECTURE"
          ? "bg-purple-100 text-purple-700"
          : "bg-teal-100 text-teal-700"
      )}
    >
      {value}
    </span>
  ),

  // Number with + prefix for positive values
  trend: (value: number) => {
    if (value === 0) return <span className="text-gray-500">0</span>;
    const isPositive = value > 0;
    return (
      <span className={isPositive ? "text-green-600" : "text-red-600"}>
        {isPositive ? "+" : ""}
        {value.toFixed(2)}
      </span>
    );
  },

  // Truncated text with tooltip
  truncate:
    (maxLength: number = 30) =>
    (value: string) => {
      if (!value || value.length <= maxLength) return value;
      return (
        <span title={value}>{value.substring(0, maxLength)}...</span>
      );
    },

  // Array as comma-separated badges
  arrayAsBadges: (value: string[]) => {
    if (!Array.isArray(value) || value.length === 0) {
      return <span className="text-gray-400">-</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 3).map((item, i) => (
          <span
            key={i}
            className="inline-flex px-1.5 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
          >
            {item}
          </span>
        ))}
        {value.length > 3 && (
          <span className="text-xs text-gray-500">+{value.length - 3} more</span>
        )}
      </div>
    );
  },

  // Clickable item (for drill-down)
  clickable: (value: string) => (
    <span className="text-blue-600 hover:text-blue-800 hover:underline">
      {value}
    </span>
  ),
};

export default DetailTable;

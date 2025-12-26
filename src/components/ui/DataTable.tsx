/**
 * @file src/components/ui/DataTable.tsx
 * @description Advanced, flexible data table component with sorting, filtering, pagination, responsive design, and file preview support
 */

"use client";

import React, { useState, useMemo } from "react";
import {
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TableCellsIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { Input } from "./Input";

// Column definition interface
export interface DataTableColumn<T> {
    key: keyof T | string;
    header: string;
    accessor?: (
        item: T,
        index?: number,
        currentPage?: number,
        pageSize?: number
    ) => React.ReactNode; // Added optional currentPage, pageSize parameters
    sortable?: boolean;
    filterable?: boolean;
    width?: string;
    align?: "left" | "center" | "right";
    className?: string;
}

// Sort configuration
export interface SortConfig {
    key: string;
    direction: "asc" | "desc";
}

// DataTable props
export interface DataTableProps<T> {
    data: T[];
    showserial?: boolean; // Whether to show serial number column
    columns: DataTableColumn<T>[];
    loading?: boolean;
    emptyMessage?: string;
    pageSize?: number;
    showPagination?: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
    onRowClick?: (item: T, index: number) => void;
    className?: string;
    rowClassName?: string | ((item: T, index: number) => string);
    headerClassName?: string;
    cellClassName?: string;
    stickyHeader?: boolean;
    maxHeight?: string;
    // File preview mode props
    previewMode?: boolean;
    previewTitle?: string;
    previewIcon?: React.ComponentType<{ className?: string }>;
    showCard?: boolean;
    autoGenerateColumns?: boolean;
}

// Generic DataTable component
export function DataTable<T extends Record<string, any>>({
    data,
    showserial = false,
    columns: providedColumns,
    loading = false,
    emptyMessage = "No data available",
    pageSize = 10,
    showPagination = true,
    showSearch = true,
    searchPlaceholder = "Search...",
    onRowClick,
    className = "",
    rowClassName = "",
    headerClassName = "",
    cellClassName = "",
    stickyHeader = false,
    maxHeight,
    // File preview mode props
    previewMode = false,
    previewTitle,
    previewIcon: PreviewIcon = TableCellsIcon,
    showCard = false,
    autoGenerateColumns = false,
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Auto-generate columns from data if needed (for file preview mode)
    const columns = useMemo((): DataTableColumn<T>[] => {
        let generatedColumns: DataTableColumn<T>[] = [];

        if (autoGenerateColumns && data.length > 0) {
            const firstRow = data[0];
            generatedColumns = Object.keys(firstRow).map((key) => ({
                key,
                header: key.charAt(0).toUpperCase() + key.slice(1),
                sortable: true,
                accessor: (item: T) => item[key] || "",
                align: "left" as const,
            }));
        } else {
            generatedColumns = providedColumns;
        }

        // Add serial number column if showserial is true
        if (showserial) {
            return [
                {
                    key: "srNo",
                    header: "Sr. No.",
                    accessor: (_item: T, index?: number) => (
                        <span className="text-light-text dark:text-dark-text">
                            {(currentPage - 1) * pageSize +
                                (index !== undefined ? index + 1 : 0)}
                        </span>
                    ),
                    align: "left",
                    // width: "50px",
                },
                ...generatedColumns,
            ];
        }

        return generatedColumns;
    }, [
        autoGenerateColumns,
        data,
        providedColumns,
        showserial,
        currentPage,
        pageSize,
    ]); // Changed dependency from startIndex to currentPage, pageSize

    // Handle sorting
    const handleSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === "asc"
        ) {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // Filter and sort data
    const processedData = useMemo(() => {
        let filtered = [...data];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter((item) =>
                columns.some((column) => {
                    // Skip serial number column for search
                    if (column.key === "srNo") return false;

                    const value = column.accessor
                        ? column.accessor(item)
                        : item[column.key as keyof T];
                    return String(value)
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());
                })
            );
        }

        // Apply sorting
        if (sortConfig) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue)
                    return sortConfig.direction === "asc" ? -1 : 1;
                if (aValue > bValue)
                    return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [data, searchTerm, sortConfig, columns]);

    // Pagination calculations
    const totalPages = Math.ceil(processedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize; // This is now a local variable for pagination display

    const paginatedData = showPagination
        ? processedData.slice(startIndex, startIndex + pageSize)
        : processedData;

    // Get sort icon
    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return null;
        }
        return sortConfig.direction === "asc" ? (
            <ChevronUpIcon className="w-4 h-4" />
        ) : (
            <ChevronDownIcon className="w-4 h-4" />
        );
    };

    // Generate pagination buttons
    const getPaginationButtons = () => {
        const buttons = [];
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        const endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(i);
        }

        return buttons;
    };

    // If no data and preview mode, show preview message
    if (previewMode && (!data || data.length === 0)) {
        return (
            <div className="h-[700px] flex items-center justify-center bg-light-background dark:bg-dark-muted-background rounded-2xl border border-light-secondary dark:border-dark-secondary">
                <p className="text-light-muted-text dark:text-dark-muted-text text-lg">
                    {emptyMessage ||
                        "Select a file and click preview to see the content"}
                </p>
            </div>
        );
    }

    // Render table content
    const tableContent = (
        <div
            className={`${
                showCard
                    ? ""
                    : `bg-light-background dark:bg-dark-background rounded-lg border border-light-secondary dark:border-dark-secondary`
            } ${className}`}
        >
            {/* Preview Header - only in preview mode with card */}
            {previewMode && showCard && previewTitle && (
                <div className="p-4 border-b border-light-secondary dark:border-dark-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                        <PreviewIcon className="h-8 w-8 text-light-highlight dark:text-dark-highlight" />
                        <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text">
                            {previewTitle}
                        </h2>
                    </div>
                </div>
            )}

            {/* Search Bar */}
            {showSearch && (
                <div className="p-4 border-b border-light-secondary dark:border-dark-secondary">
                    <Input
                        leftIcon={
                            <MagnifyingGlassIcon className="w-5 h-5 text-light-muted-text dark:text-dark-muted-text" />
                        }
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-light-muted-background dark:bg-dark-muted-background
                                    text-light-text dark:text-dark-text border border-light-secondary dark:border-dark-secondary
                                    rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                    />
                </div>
            )}

            {/* Table Container */}
            <div
                className={`overflow-auto ${
                    maxHeight
                        ? `max-h-[${maxHeight}]`
                        : previewMode
                        ? "max-h-[600px]"
                        : ""
                } ${
                    previewMode
                        ? "scrollbar-thin scrollbar-thumb-light-secondary dark:scrollbar-thumb-dark-secondary scrollbar-track-transparent hover:scrollbar-thumb-light-tertiary dark:hover:scrollbar-thumb-dark-tertiary"
                        : ""
                }`}
            >
                <div className="overflow-x-auto">
                    <table
                        className={`w-full ${
                            previewMode
                                ? "min-w-full divide-y divide-light-secondary dark:divide-dark-secondary"
                                : ""
                        }`}
                    >
                        {/* Table Header */}
                        <thead
                            className={`${
                                previewMode
                                    ? "bg-light-muted-background dark:bg-dark-noisy-background"
                                    : "bg-light-muted-background dark:bg-dark-muted-background"
                            } ${
                                stickyHeader ? "sticky top-0 z-10" : ""
                            } ${headerClassName}`}
                        >
                            <tr>
                                {columns.map((column, index) => (
                                    <th
                                        key={String(column.key) + index}
                                        className={`${
                                            previewMode
                                                ? "px-6 py-4 text-left text-xs font-semibold text-light-muted-text dark:text-dark-muted-text uppercase tracking-wider"
                                                : `px-4 py-3 text-left text-sm font-medium text-light-muted-text dark:text-dark-muted-text
                                        border-b border-light-secondary dark:border-dark-secondary
                                        ${
                                            column.sortable
                                                ? "cursor-pointer hover:bg-light-hover dark:hover:bg-dark-hover"
                                                : ""
                                        }`
                                        }
                                        ${
                                            column.align === "center"
                                                ? "text-center"
                                                : ""
                                        }
                                        ${
                                            column.align === "right"
                                                ? "text-right"
                                                : ""
                                        }
                                        ${
                                            column.width
                                                ? `w-[${column.width}]`
                                                : ""
                                        }
                                        ${column.className || ""}`}
                                        onClick={() =>
                                            column.sortable &&
                                            column.key !== "srNo" &&
                                            handleSort(String(column.key))
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            {column.header}
                                            {column.sortable &&
                                                column.key !== "srNo" &&
                                                getSortIcon(String(column.key))}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody
                            className={
                                previewMode
                                    ? "divide-y divide-light-secondary dark:divide-dark-secondary"
                                    : ""
                            }
                        >
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-4 py-8 text-center"
                                    >
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
                                            <span className="ml-2 text-light-muted-text dark:text-dark-muted-text">
                                                Loading...
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-4 py-8 text-center text-light-muted-text dark:text-dark-muted-text"
                                    >
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className={`${
                                            previewMode
                                                ? ""
                                                : "border-b border-light-secondary dark:border-dark-secondary"
                                        }
                                        hover:bg-light-hover dark:hover:bg-dark-hover transition-colors
                                        ${onRowClick ? "cursor-pointer" : ""}
                                        ${
                                            typeof rowClassName === "function"
                                                ? rowClassName(item, rowIndex)
                                                : rowClassName
                                        }`}
                                        onClick={() =>
                                            onRowClick &&
                                            onRowClick(item, rowIndex)
                                        }
                                    >
                                        {columns.map((column, colIndex) => (
                                            <td
                                                key={
                                                    String(column.key) +
                                                    colIndex
                                                }
                                                className={`${
                                                    previewMode
                                                        ? "px-6 py-4 whitespace-nowrap text-sm text-light-text dark:text-dark-text"
                                                        : "px-4 py-3 text-sm text-light-text dark:text-dark-text"
                                                }
                                                ${
                                                    column.align === "center"
                                                        ? "text-center"
                                                        : ""
                                                }
                                                ${
                                                    column.align === "right"
                                                        ? "text-right"
                                                        : ""
                                                }
                                                ${cellClassName}`}
                                            >
                                                {column.accessor
                                                    ? column.accessor(
                                                          item,
                                                          rowIndex,
                                                          currentPage,
                                                          pageSize
                                                      ) // Pass currentPage, pageSize to accessor
                                                    : String(
                                                          item[
                                                              column.key as keyof T
                                                          ] || ""
                                                      )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {showPagination && processedData.length > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-light-secondary dark:border-dark-secondary bg-light-muted-background dark:bg-dark-muted-background rounded-b-lg">
                    <div className="text-sm text-light-muted-text dark:text-dark-muted-text">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(startIndex + pageSize, processedData.length)}{" "}
                        of {processedData.length} results
                        {totalPages > 1 &&
                            ` • Page ${currentPage} of ${totalPages}`}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            <button
                                onClick={() =>
                                    setCurrentPage(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                                title="Previous page"
                                className="px-3 py-2 text-sm border border-light-secondary dark:border-dark-secondary
                                        bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text
                                        rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors
                                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Previous
                                </span>
                            </button>

                            {/* Page Numbers */}
                            {getPaginationButtons().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-2 text-sm border rounded-lg transition-colors font-medium
                                            ${
                                                page === currentPage
                                                    ? "bg-primary-main text-white border-primary-main shadow-sm"
                                                    : "border-light-secondary dark:border-dark-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover hover:border-primary-main"
                                            }`}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* Next Button */}
                            <button
                                onClick={() =>
                                    setCurrentPage(
                                        Math.min(totalPages, currentPage + 1)
                                    )
                                }
                                disabled={currentPage === totalPages}
                                title="Next page"
                                className="px-3 py-2 text-sm border border-light-secondary dark:border-dark-secondary
                                        bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text
                                        rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors
                                        disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Wrap in Card if showCard is true
    if (showCard) {
        return (
            <Card className="bg-light-background dark:bg-dark-muted-background shadow-sm border border-light-secondary dark:border-dark-secondary rounded-2xl overflow-hidden">
                {tableContent}
            </Card>
        );
    }

    return tableContent;
}

export default DataTable;

/**
 * @file src/components/ui/Pagination.tsx
 * @description Standalone pagination component with customizable display and navigation
 */

"use client";

import React from "react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

// Pagination props interface
export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    showPageNumbers?: boolean;
    showInfo?: boolean;
    maxVisiblePages?: number;
    size?: "sm" | "md" | "lg";
    className?: string;
    compact?: boolean;
}

// Pagination component
export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    showFirstLast = true,
    showPrevNext = true,
    showPageNumbers = true,
    showInfo = true,
    maxVisiblePages = 5,
    size = "lg",
    className = "",
    compact = false,
}) => {
    // Calculate visible page range
    const getVisiblePages = (): number[] => {
        const pages: number[] = [];

        if (totalPages <= maxVisiblePages) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const halfVisible = Math.floor(maxVisiblePages / 2);
            let start = Math.max(1, currentPage - halfVisible);
            let end = Math.min(totalPages, currentPage + halfVisible);

            // Adjust if we're near the beginning or end
            if (end - start + 1 < maxVisiblePages) {
                if (start === 1) {
                    end = Math.min(totalPages, start + maxVisiblePages - 1);
                } else {
                    start = Math.max(1, end - maxVisiblePages + 1);
                }
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    // Calculate info text
    const getInfoText = (): string => {
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);
        return `Showing ${startItem} to ${endItem} of ${totalItems} results`;
    };

    // Size configurations
    const sizeConfig = {
        sm: {
            button: "h-8 w-8 text-xs border border-light-secondary dark:border-dark-secondary rounded-sm flex items-center justify-center hover:bg-light-secondary dark:hover:bg-dark-secondary",
            text: "text-xs",
            spacing: "gap-1",
        },
        md: {
            button: "h-10 w-10 text-sm border border-light-secondary dark:border-dark-secondary rounded-md flex items-center justify-center hover:bg-light-secondary dark:hover:bg-dark-secondary",
            text: "text-sm",
            spacing: "gap-2",
        },
        lg: {
            button: "h-12 w-12 text-base border border-light-secondary dark:border-dark-secondary rounded-lg flex items-center justify-center hover:bg-light-secondary dark:hover:bg-dark-secondary",
            text: "text-base",
            spacing: "gap-3",
        },
    };

    const config = sizeConfig[size];

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    // Return null if no pagination needed
    if (totalPages <= 1) return null;

    const visiblePages = getVisiblePages();

    // Compact version
    if (compact) {
        return (
            <div className={`flex items-center justify-between ${className}`}>
                {showInfo && (
                    <div
                        className={`text-light-muted-text dark:text-dark-muted-text ${config.text}`}
                    >
                        Page {currentPage} of {totalPages}
                    </div>
                )}

                <div className={`flex items-center ${config.spacing}`}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={config.button}
                        title="Previous page"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </button>

                    <span
                        className={`px-2 text-light-text dark:text-dark-text ${config.text}`}
                    >
                        {currentPage} / {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={config.button}
                        title="Next page"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Info text */}
            {showInfo && (
                <div
                    className={`text-light-muted-text dark:text-dark-muted-text ${config.text}`}
                >
                    {getInfoText()}
                </div>
            )}

            {/* Pagination controls */}
            <div
                className={`flex items-center justify-center ${config.spacing}`}
            >
                {/* First page */}
                {showFirstLast && currentPage > 1 && (
                    <button
                        onClick={() => handlePageChange(1)}
                        className={config.button}
                        title="First page"
                    >
                        <ChevronDoubleLeftIcon className="w-4 h-4" />
                    </button>
                )}

                {/* Previous page */}
                {showPrevNext && (
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={config.button}
                        title="Previous page"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                    </button>
                )}

                {/* Page numbers */}
                {showPageNumbers && (
                    <>
                        {/* Show ellipsis if there are hidden pages at the beginning */}
                        {visiblePages[0] > 1 && (
                            <>
                                <button
                                    onClick={() => handlePageChange(1)}
                                    className={`${config.button} ${
                                        currentPage === 1
                                            ? "text-light-highlight dark:text-dark-highlight"
                                            : ""
                                    }`}
                                >
                                    1
                                </button>
                                {visiblePages[0] > 2 && (
                                    <span
                                        className={`px-2 text-light-muted-text dark:text-dark-muted-text ${config.text}`}
                                    >
                                        ...
                                    </span>
                                )}
                            </>
                        )}

                        {/* Visible page numbers */}
                        {visiblePages.map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`${config.button} ${
                                    currentPage === page
                                        ? "text-light-highlight dark:text-dark-highlight"
                                        : ""
                                }`}
                                title={`Go to page ${page}`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Show ellipsis if there are hidden pages at the end */}
                        {visiblePages[visiblePages.length - 1] < totalPages && (
                            <>
                                {visiblePages[visiblePages.length - 1] <
                                    totalPages - 1 && (
                                    <span
                                        className={`px-2 text-light-muted-text dark:text-dark-muted-text ${config.text}`}
                                    >
                                        ...
                                    </span>
                                )}
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    className={`${config.button} ${
                                        currentPage === totalPages
                                            ? "text-light-highlight dark:text-dark-highlight"
                                            : ""
                                    }`}
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}
                    </>
                )}

                {/* Next page */}
                {showPrevNext && (
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={config.button}
                        title="Next page"
                    >
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                )}

                {/* Last page */}
                {showFirstLast && currentPage < totalPages && (
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        className={config.button}
                        title="Last page"
                    >
                        <ChevronDoubleRightIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Pagination;

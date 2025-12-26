// src/components/ui/AcademicYearCard.tsx
"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AcademicYear } from "@/interfaces/academicYear";
import {
    Calendar,
    Edit2,
    Trash2,
    CheckCircle,
    Clock,
    BookOpen,
    Users,
} from "lucide-react";
import clsx from "clsx";

interface AcademicYearCardProps {
    academicYear: AcademicYear;
    onEdit: (academicYear: AcademicYear) => void;
    onDelete: (id: string) => void;
    onClick?: (academicYear: AcademicYear) => void;
    className?: string;
}

export const AcademicYearCard: React.FC<AcademicYearCardProps> = ({
    academicYear,
    onEdit,
    onDelete,
    onClick,
    className = "",
}) => {
    const isClickable = !!onClick;

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent card click when clicking action buttons
        if ((e.target as HTMLElement).closest("button")) {
            return;
        }
        if (onClick) {
            onClick(academicYear);
        }
    };

    return (
        <Card
            onClick={handleCardClick}
            className={clsx(
                "relative overflow-hidden transition-all duration-300 rounded-2xl",
                "bg-light-background dark:bg-dark-muted-background",
                "border border-light-secondary dark:border-dark-secondary",
                "flex flex-col justify-between h-full",
                {
                    "cursor-pointer group hover:shadow-lg": isClickable,
                    "hover:border-primary-main": isClickable,
                    "hover:bg-light-muted-background dark:hover:bg-dark-noisy-background":
                        isClickable,
                    "bg-primary-lighter dark:bg-primary-darker border-primary-main":
                        academicYear.isActive,
                },
                className
            )}
            {...(isClickable && {
                role: "button",
                tabIndex: 0,
                "aria-label": `View details for ${academicYear.yearString}`,
            })}
        >
            {/* Animated left border for clickable cards */}
            {isClickable && (
                <div className="absolute top-0 left-0 w-2 h-full bg-primary-main transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            )}

            <div className="p-5 flex flex-col h-full">
                {/* Header with title and status */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-5 w-5 text-primary-main" />
                            <h3 className="text-lg font-bold text-light-text dark:text-dark-text group-hover:text-primary-main transition-colors duration-300">
                                {academicYear.yearString}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {academicYear.isActive ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Active
                                </Badge>
                            ) : (
                                <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 text-xs">
                                    Inactive
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 mb-4">
                    <div className="space-y-2 text-sm text-light-muted-text dark:text-dark-muted-text">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                                Created:{" "}
                                {new Date(
                                    academicYear.createdAt
                                ).toLocaleDateString()}
                            </span>
                        </div>
                        {academicYear.updatedAt !== academicYear.createdAt && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>
                                    Updated:{" "}
                                    {new Date(
                                        academicYear.updatedAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                        {/* Display semester and subject allocation counts if available */}
                        {academicYear._count && (
                            <div className="pt-2 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>
                                        Semesters:{" "}
                                        {academicYear._count.semesters}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    <span>
                                        Subject Allocations:{" "}
                                        {academicYear._count.subjectAllocations}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-light-secondary dark:border-dark-secondary">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(academicYear);
                        }}
                        className="h-8 px-3 text-xs hover:bg-primary-lighter hover:text-primary-main"
                    >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(academicYear.id);
                        }}
                        className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                    </Button>
                </div>
            </div>
        </Card>
    );
};

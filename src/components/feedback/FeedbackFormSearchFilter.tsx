// src/components/feedback/FeedbackFormSearchFilter.tsx
"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { FeedbackForm, FeedbackFormStatus } from "@/interfaces/feedbackForm";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Select } from "../ui";
import { useMemo } from "react";

interface FeedbackFormSearchFilterProps {
    searchTerm: string;
    statusFilter: FeedbackFormStatus | "ALL";
    academicYearFilter: string;
    departmentFilter: string;
    divisionFilter: string;
    sortOrder: "asc" | "desc";
    forms: FeedbackForm[];
    onSearchChange: (value: string) => void;
    onStatusFilterChange: (value: FeedbackFormStatus | "ALL") => void;
    onAcademicYearFilterChange: (value: string) => void;
    onDepartmentFilterChange: (value: string) => void;
    onDivisionFilterChange: (value: string) => void;
    onSortOrderChange: (value: "asc" | "desc") => void;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const FeedbackFormSearchFilter = ({
    searchTerm,
    statusFilter,
    academicYearFilter,
    departmentFilter,
    divisionFilter,
    sortOrder,
    forms,
    onSearchChange,
    onStatusFilterChange,
    onAcademicYearFilterChange,
    onDepartmentFilterChange,
    onDivisionFilterChange,
    onSortOrderChange,
}: FeedbackFormSearchFilterProps) => {
    // Extract unique academic years
    const academicYears = useMemo(() => {
        const years = new Set<string>();
        forms.forEach((form) => {
            if (form.division?.semester?.academicYear?.yearString) {
                years.add(form.division.semester.academicYear.yearString);
            }
        });
        return Array.from(years).sort();
    }, [forms]);

    // Extract unique departments based on selected academic year
    const departments = useMemo(() => {
        const deptNames = new Set<string>();
        forms.forEach((form) => {
            if (
                form.division?.department &&
                (academicYearFilter === "ALL" ||
                    form.division?.semester?.academicYear?.yearString ===
                        academicYearFilter)
            ) {
                deptNames.add(form.division.department.name);
            }
        });
        return Array.from(deptNames).sort();
    }, [forms, academicYearFilter]);

    // Extract unique divisions based on selected academic year and department
    const divisions = useMemo(() => {
        const divNames = new Set<string>();
        forms.forEach((form) => {
            if (
                form.division &&
                (academicYearFilter === "ALL" ||
                    form.division?.semester?.academicYear?.yearString ===
                        academicYearFilter) &&
                (departmentFilter === "ALL" ||
                    form.division?.department?.name === departmentFilter)
            ) {
                divNames.add(form.division.divisionName);
            }
        });
        return Array.from(divNames).sort();
    }, [forms, academicYearFilter, departmentFilter]);

    // Handle filter changes with cascading reset
    const handleAcademicYearChange = (value: string) => {
        onAcademicYearFilterChange(value);
        // Reset dependent filters
        onDepartmentFilterChange("ALL");
        onDivisionFilterChange("ALL");
    };

    const handleDepartmentChange = (value: string) => {
        onDepartmentFilterChange(value);
        // Reset dependent filters
        onDivisionFilterChange("ALL");
    };

    // Clear all filters
    const handleClearFilters = () => {
        onSearchChange("");
        onStatusFilterChange("ALL");
        onAcademicYearFilterChange("ALL");
        onDepartmentFilterChange("ALL");
        onDivisionFilterChange("ALL");
        // onSortOrderChange("asc");
    };

    // Check if any filters are active
    const hasActiveFilters =
        searchTerm !== "" ||
        statusFilter !== "ALL" ||
        academicYearFilter !== "ALL" ||
        departmentFilter !== "ALL" ||
        divisionFilter !== "ALL" ||
        sortOrder !== "asc";

    return (
        <motion.div
            variants={itemVariants}
            className="bg-light-background dark:bg-dark-muted-background p-4 rounded-xl shadow-sm border border-light-secondary dark:border-dark-secondary"
        >
            <div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-muted-text dark:text-dark-muted-text w-4 h-4" />
                        <Input
                            leftIcon={
                                <MagnifyingGlassIcon className="w-5 h-5 text-light-muted-text dark:text-dark-muted-text" />
                            }
                            type="text"
                            placeholder="Search by title, department, division, or academic year..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full bg-light-muted-background dark:bg-dark-muted-background 
                     text-light-text dark:text-dark-text border border-light-secondary dark:border-dark-secondary 
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                        />
                    </div>

                    {/* Filters and Sort Row */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 flex-wrap">
                        {/* Sort Order Toggle Button */}
                        <button
                            onClick={() =>
                                onSortOrderChange(
                                    sortOrder === "asc" ? "desc" : "asc"
                                )
                            }
                            className="px-3 py-2 border border-light-secondary dark:border-dark-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-lg text-sm"
                        >
                            {sortOrder === "asc"
                                ? "Sort: A to Z"
                                : "Sort: Z to A"}
                        </button>

                        {/* Status Filter */}
                        <Select
                            id="status-select"
                            name="status-select"
                            value={statusFilter}
                            onChange={(e) =>
                                onStatusFilterChange(
                                    e.target.value as FeedbackFormStatus | "ALL"
                                )
                            }
                        >
                            <option value="ALL">All Status</option>
                            <option value={FeedbackFormStatus.DRAFT}>
                                Draft
                            </option>
                            <option value={FeedbackFormStatus.ACTIVE}>
                                Active
                            </option>
                            <option value={FeedbackFormStatus.CLOSED}>
                                Closed
                            </option>
                        </Select>

                        {/* Academic Year Filter */}
                        <Select
                            id="academic-year-select"
                            name="academic-year-select"
                            value={academicYearFilter}
                            onChange={(e) =>
                                handleAcademicYearChange(e.target.value)
                            }
                        >
                            <option value="ALL">All Academic Years</option>
                            {academicYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </Select>

                        {/* Department Filter */}
                        <Select
                            id="department-select"
                            name="department-select"
                            value={departmentFilter}
                            onChange={(e) =>
                                handleDepartmentChange(e.target.value)
                            }
                            disabled={departments.length === 0}
                        >
                            <option value="ALL">All Departments</option>
                            {departments.map((deptName) => (
                                <option key={deptName} value={deptName}>
                                    {deptName}
                                </option>
                            ))}
                        </Select>

                        {/* Division Filter */}
                        <Select
                            id="division-select"
                            name="division-select"
                            value={divisionFilter}
                            onChange={(e) =>
                                onDivisionFilterChange(e.target.value)
                            }
                            disabled={divisions.length === 0}
                        >
                            <option value="ALL">All Divisions</option>
                            {divisions.map((divName) => (
                                <option key={divName} value={divName}>
                                    {divName}
                                </option>
                            ))}
                        </Select>

                        <div className="flex items-center gap-2">
                            <div>
                                <button
                                    onClick={handleClearFilters}
                                    className="flex py-2 px-3 items-center gap-1 bg-transparent border rounded-xl border-red-600 text-sm
               text-red-600 dark:text-red-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-500 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    disabled={!hasActiveFilters}
                                >
                                    <X className="w-4 h-4" />
                                    Clear All Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

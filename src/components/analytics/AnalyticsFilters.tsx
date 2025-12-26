/**
 * @file src/components/analytics/AnalyticsFilters.tsx
 * @description Clean and intuitive filtering component for analytics
 */

"use client";

import React, { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import {
    Filter,
    X,
    Calendar,
    Building,
    Users,
    GraduationCap,
    Monitor,
} from "lucide-react";
import {
    FilterDictionary,
    AnalyticsFilterParams,
} from "@/interfaces/analytics";

interface AnalyticsFiltersProps {
    filterDictionary: FilterDictionary | undefined;
    filters: AnalyticsFilterParams;
    onFiltersChange: (filters: AnalyticsFilterParams) => void;
    onRefresh: () => void;
    isLoading?: boolean;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
    filterDictionary,
    filters,
    onFiltersChange,
}) => {
    // Get dependent options based on selected filters
    const departments = useMemo(() => {
        if (!filters.academicYearId || !filterDictionary) return [];
        const selectedYear = filterDictionary.academicYears.find(
            (year) => year.id === filters.academicYearId
        );
        return selectedYear?.departments || [];
    }, [filterDictionary, filters.academicYearId]);

    const semesters = useMemo(() => {
        if (!filters.departmentId || !departments.length) return [];
        const selectedDept = departments.find(
            (dept) => dept.id === filters.departmentId
        );
        return selectedDept?.semesters || [];
    }, [departments, filters.departmentId]);

    const divisions = useMemo(() => {
        if (!filters.semesterId || !semesters.length) return [];
        const selectedSemester = semesters.find(
            (sem) => sem.id === filters.semesterId
        );
        return selectedSemester?.divisions || [];
    }, [semesters, filters.semesterId]);

    // Handle filter changes
    const updateFilter = (key: keyof AnalyticsFilterParams, value: any) => {
        const newFilters = { ...filters, [key]: value };

        // Clear dependent filters when parent changes
        if (key === "academicYearId") {
            newFilters.departmentId = undefined;
            newFilters.semesterId = undefined;
            newFilters.divisionId = undefined;
        } else if (key === "departmentId") {
            newFilters.semesterId = undefined;
            newFilters.divisionId = undefined;
        } else if (key === "semesterId") {
            newFilters.divisionId = undefined;
        }

        onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
        // Reset all filters to their initial state
        const initialFilters: AnalyticsFilterParams = {
            academicYearId: undefined,
            departmentId: undefined,
            semesterId: undefined,
            divisionId: undefined,
            lectureType: undefined,
            includeDeleted: false,
        };
        onFiltersChange(initialFilters);
    };

    const getActiveFiltersCount = () => {
        return Object.entries(filters).filter(
            ([value]) => value !== undefined && value !== ""
        ).length;
    };

    return (
        <div className="w-full">
            <div className="p-2">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-light-secondary dark:bg-dark-secondary">
                            <Filter className="h-6 w-6 text-light-highlight dark:text-dark-highlight" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-light-text dark:text-dark-text">
                                Analytics Filters
                            </h1>
                        </div>
                        {getActiveFiltersCount() > 0 && (
                            <Badge className="bg-light-highlight dark:bg-dark-highlight text-white font-medium">
                                {getActiveFiltersCount()} active
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={clearAllFilters}
                            disabled={getActiveFiltersCount() === 0}
                            className="flex py-2 px-3 items-center gap-1 bg-transparent border rounded-xl border-red-600 text-sm
               text-red-600 dark:text-red-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-500 hover:shadow-lg dark:hover:shadow-red-700/20"
                        >
                            <X className="w-4 h-4" />
                            Clear All Filters
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {/* Academic Year */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Academic Year
                        </Label>
                        <Select
                            id="academic-year"
                            name="academicYear"
                            value={filters.academicYearId || ""}
                            onChange={(e) =>
                                updateFilter(
                                    "academicYearId",
                                    e.target.value || undefined
                                )
                            }
                        >
                            <option value="">All Years</option>
                            {filterDictionary?.academicYears.map((year) => (
                                <option key={year.id} value={year.id}>
                                    {year.yearString}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Department */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            Department
                        </Label>
                        <Select
                            id="department"
                            name="department"
                            value={filters.departmentId || ""}
                            onChange={(e) =>
                                updateFilter(
                                    "departmentId",
                                    e.target.value || undefined
                                )
                            }
                            disabled={!filters.academicYearId}
                        >
                            <option value="">All Departments</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name} ({dept.abbreviation})
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Semester */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            Semester
                        </Label>
                        <Select
                            id="semester"
                            name="semester"
                            value={filters.semesterId || ""}
                            onChange={(e) =>
                                updateFilter(
                                    "semesterId",
                                    e.target.value || undefined
                                )
                            }
                            disabled={!filters.departmentId}
                        >
                            <option value="">All Semesters</option>
                            {semesters.map((sem) => (
                                <option key={sem.id} value={sem.id}>
                                    Semester {sem.semesterNumber}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Division */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Division
                        </Label>
                        <Select
                            id="division"
                            name="division"
                            value={filters.divisionId || ""}
                            onChange={(e) =>
                                updateFilter(
                                    "divisionId",
                                    e.target.value || undefined
                                )
                            }
                            disabled={!filters.semesterId}
                        >
                            <option value="">All Divisions</option>
                            {divisions.map((division) => (
                                <option key={division.id} value={division.id}>
                                    {division.divisionName}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Lecture Type */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                            <Monitor className="h-4 w-4" />
                            Type
                        </Label>
                        <Select
                            id="lecture-type"
                            name="lectureType"
                            value={filters.lectureType || ""}
                            onChange={(e) =>
                                updateFilter(
                                    "lectureType",
                                    e.target.value || undefined
                                )
                            }
                        >
                            <option value="">All Types</option>
                            {filterDictionary?.lectureTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* Include Deleted Toggle */}
                <div className="flex items-center justify-between pt-6 mt-6 border-t border-light-secondary dark:border-dark-secondary">
                    <div className="flex items-center space-x-3">
                        <Switch
                            id="include-deleted"
                            checked={filters.includeDeleted || false}
                            onCheckedChange={(checked) =>
                                updateFilter("includeDeleted", checked)
                            }
                        />
                        <Label
                            htmlFor="include-deleted"
                            className="text-sm mb-2 font-medium text-light-text dark:text-dark-text"
                        >
                            Include deleted records
                        </Label>
                    </div>
                    <p className="text-xs text-light-muted-text dark:text-dark-muted-text">
                        Show all-time data including soft-deleted entries
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * @file src/hooks/faculty/useFacultyData.ts
 * @description Provides faculty data, filtering, sorting, and department stats for faculty management UI
 */

import { useState, useMemo, useCallback } from "react";
import { useAllFaculties } from "./useFaculties";
import { useAllDepartments } from "../useDepartments";
import { Faculty } from "@/interfaces/faculty";
import { Department } from "@/interfaces/department";
import { IdType } from "@/interfaces/common";

export type SortOrder = "asc" | "desc";

// Define the structure for department statistics
interface DepartmentStats {
    departmentName: string;
    count: number;
}

interface UseFacultyDataResult {
    faculty: Faculty[];
    departments: Department[];
    departmentStats: DepartmentStats[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedDepartment: IdType | ""; // Type remains IdType or empty string
    setSelectedDepartment: (id: IdType | "") => void;
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
    filteredAndSortedFaculty: Faculty[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetchFaculty: () => Promise<any>; // Changed return type to Promise<any>
    refetchDepartments: () => Promise<any>; // Changed return type to Promise<any>
}

export const useFacultyData = (): UseFacultyDataResult => {
    // State for filters and sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<IdType | "">(
        ""
    );
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    // Fetch faculty data using TanStack Query hook
    const {
        data: allFaculty = [],
        isLoading: isLoadingFaculty,
        isError: isErrorFaculty,
        error: facultyError,
        refetch: refetchAllFaculty,
    } = useAllFaculties();

    // Fetch department data using TanStack Query hook
    const {
        data: allDepartments = [],
        isLoading: isLoadingDepartments,
        isError: isErrorDepartments,
        error: departmentsError,
        refetch: refetchAllDepartments,
    } = useAllDepartments();

    // Combine loading and error states
    const isLoading = isLoadingFaculty || isLoadingDepartments;
    const isError = isErrorFaculty || isErrorDepartments;
    const error = facultyError || departmentsError;

    // Memoize department statistics calculation
    const departmentStats = useMemo(() => {
        const statsMap = new Map<string, number>();
        allFaculty.forEach((f) => {
            const deptName =
                allDepartments.find((dept) => dept.id === f.departmentId)
                    ?.name ||
                f.departmentAbbreviation ||
                "Unknown Department";

            statsMap.set(deptName, (statsMap.get(deptName) || 0) + 1);
        });
        return Array.from(statsMap.entries()).map(
            ([departmentName, count]) => ({
                departmentName,
                count,
            })
        );
    }, [allFaculty, allDepartments]);

    const filteredAndSortedFaculty = useMemo(() => {
        const filtered = allFaculty.filter((f) => {
            const matchesSearch =
                (f.name?.toLowerCase() || "").includes(
                    searchTerm.toLowerCase()
                ) ||
                (f.email?.toLowerCase() || "").includes(
                    searchTerm.toLowerCase()
                ) ||
                (f.abbreviation?.toLowerCase() || "").includes(
                    searchTerm.toLowerCase()
                );

            // Department filter: If selectedDepartment is empty string (All Departments), or matches faculty's departmentId
            const matchesDepartment =
                selectedDepartment === "" ||
                f.departmentId === selectedDepartment;

            return matchesSearch && matchesDepartment;
        });

        // Sort by the 'name' property directly
        filtered.sort((a, b) => {
            const nameA = (a.name || "").toLowerCase();
            const nameB = (b.name || "").toLowerCase();
            if (sortOrder === "asc") {
                return nameA.localeCompare(nameB);
            }
            return nameB.localeCompare(nameA);
        });

        return filtered;
    }, [allFaculty, searchTerm, selectedDepartment, sortOrder]);

    // Expose refetch functions, now awaiting the underlying query refetch
    const refetchFaculty = useCallback(async () => {
        return await refetchAllFaculty(); // Await the refetch and return its promise
    }, [refetchAllFaculty]);

    const refetchDepartments = useCallback(async () => {
        return await refetchAllDepartments(); // Await the refetch and return its promise
    }, [refetchAllDepartments]);

    return {
        faculty: allFaculty,
        departments: allDepartments,
        departmentStats,
        searchTerm,
        setSearchTerm,
        selectedDepartment,
        setSelectedDepartment,
        sortOrder,
        setSortOrder,
        filteredAndSortedFaculty,
        isLoading,
        isError,
        error,
        refetchFaculty,
        refetchDepartments,
    };
};

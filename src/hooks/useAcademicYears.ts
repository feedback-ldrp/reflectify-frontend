/**
 * @file src/hooks/useAcademicYears.ts
 * @description React Query hooks for Academic Year CRUD operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicYearService } from "@/services/academicYear.service";
import {
    AcademicYear,
    CreateAcademicYearData,
    UpdateAcademicYearData,
    AcademicYearStats,
} from "@/interfaces/academicYear";
import { IdType } from "@/interfaces/common";
import { showToast } from "@/lib/toast";

// Query keys for academic year data
export const ACADEMIC_YEAR_QUERY_KEYS = {
    all: ["academicYears"] as const,
    lists: () => [...ACADEMIC_YEAR_QUERY_KEYS.all, "list"] as const,
    detail: (id: IdType) => [...ACADEMIC_YEAR_QUERY_KEYS.all, id] as const,
    active: () => [...ACADEMIC_YEAR_QUERY_KEYS.all, "active"] as const,
};

// Fetch all academic years
export const useAllAcademicYears = () => {
    return useQuery<AcademicYear[], Error>({
        queryKey: ACADEMIC_YEAR_QUERY_KEYS.lists(),
        queryFn: academicYearService.getAllAcademicYears,
        staleTime: 5 * 60 * 1000,
    });
};

// Fetch a single academic year by ID
export const useAcademicYear = (id: IdType) => {
    return useQuery<AcademicYear, Error>({
        queryKey: ACADEMIC_YEAR_QUERY_KEYS.detail(id),
        queryFn: () => academicYearService.getAcademicYearById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};

// Create a new academic year
export const useCreateAcademicYear = () => {
    const queryClient = useQueryClient();
    return useMutation<AcademicYear, Error, CreateAcademicYearData>({
        mutationFn: academicYearService.createAcademicYear,
        onSuccess: (newAcademicYear) => {
            queryClient.invalidateQueries({
                queryKey: ACADEMIC_YEAR_QUERY_KEYS.lists(),
            });
            queryClient.setQueryData<AcademicYear[]>(
                ACADEMIC_YEAR_QUERY_KEYS.lists(),
                (old) => (old ? [newAcademicYear, ...old] : [newAcademicYear])
            );
            showToast.success("Academic year created!");
        },
        onError: (error: Error) => {
            showToast.error(error?.message || "Failed to create academic year");
        },
    });
};

// Update an academic year
export const useUpdateAcademicYear = () => {
    const queryClient = useQueryClient();
    return useMutation<
        AcademicYear,
        Error,
        { id: IdType; data: UpdateAcademicYearData },
        {
            previousYear: AcademicYear | undefined;
            previousYearsList: AcademicYear[] | undefined;
        }
    >({
        mutationFn: ({ id, data }) =>
            academicYearService.updateAcademicYear(id, data),
        onMutate: async ({ id, data: updateData }) => {
            await queryClient.cancelQueries({
                queryKey: ACADEMIC_YEAR_QUERY_KEYS.detail(id),
            });
            await queryClient.cancelQueries({
                queryKey: ACADEMIC_YEAR_QUERY_KEYS.lists(),
            });
            const previousYear = queryClient.getQueryData<AcademicYear>(
                ACADEMIC_YEAR_QUERY_KEYS.detail(id)
            );
            const previousYearsList = queryClient.getQueryData<AcademicYear[]>(
                ACADEMIC_YEAR_QUERY_KEYS.lists()
            );
            queryClient.setQueryData<AcademicYear>(
                ACADEMIC_YEAR_QUERY_KEYS.detail(id),
                (old) => (old ? { ...old, ...updateData } : old)
            );
            queryClient.setQueryData<AcademicYear[]>(
                ACADEMIC_YEAR_QUERY_KEYS.lists(),
                (old) =>
                    old?.map((year) =>
                        year.id === id ? { ...year, ...updateData } : year
                    )
            );
            return { previousYear, previousYearsList };
        },
        onSuccess: (updatedAcademicYear, variables) => {
            queryClient.setQueryData<AcademicYear[]>(
                ACADEMIC_YEAR_QUERY_KEYS.lists(),
                (old) =>
                    old?.map((academicYear) =>
                        academicYear.id === variables.id
                            ? updatedAcademicYear
                            : academicYear
                    ) || []
            );
            queryClient.setQueryData(
                ACADEMIC_YEAR_QUERY_KEYS.detail(variables.id),
                updatedAcademicYear
            );
            showToast.success("Academic year updated!");
        },
        onError: (err, variables, context) => {
            if (context?.previousYear) {
                queryClient.setQueryData(
                    ACADEMIC_YEAR_QUERY_KEYS.detail(variables.id),
                    context.previousYear
                );
            }
            if (context?.previousYearsList) {
                queryClient.setQueryData(
                    ACADEMIC_YEAR_QUERY_KEYS.lists(),
                    context.previousYearsList
                );
            }
            showToast.error(err?.message || "Failed to update academic year");
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({
                queryKey: ACADEMIC_YEAR_QUERY_KEYS.detail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: ACADEMIC_YEAR_QUERY_KEYS.lists(),
            });
        },
    });
};

// Soft delete an academic year
export const useSoftDeleteAcademicYear = () => {
    const queryClient = useQueryClient();
    return useMutation<
        void,
        Error,
        IdType,
        { previousYearsList: AcademicYear[] | undefined }
    >({
        mutationFn: (id) => academicYearService.deleteAcademicYear(id),
        onMutate: async (idToDelete) => {
            await queryClient.cancelQueries({
                queryKey: ACADEMIC_YEAR_QUERY_KEYS.lists(),
            });
            const previousYearsList = queryClient.getQueryData<AcademicYear[]>(
                ACADEMIC_YEAR_QUERY_KEYS.lists()
            );
            queryClient.setQueryData<AcademicYear[]>(
                ACADEMIC_YEAR_QUERY_KEYS.lists(),
                (old) => old?.filter((year) => year.id !== idToDelete)
            );
            return { previousYearsList };
        },
        onSuccess: (_, deletedId) => {
            queryClient.invalidateQueries({
                queryKey: ACADEMIC_YEAR_QUERY_KEYS.lists(),
            });
            queryClient.removeQueries({
                queryKey: ACADEMIC_YEAR_QUERY_KEYS.detail(deletedId),
            });
            showToast.success("Academic year deleted!");
        },
        onError: (err, idToDelete, context) => {
            if (context?.previousYearsList) {
                queryClient.setQueryData(
                    ACADEMIC_YEAR_QUERY_KEYS.lists(),
                    context.previousYearsList
                );
            }
            showToast.error(err?.message || "Failed to delete academic year");
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ACADEMIC_YEAR_QUERY_KEYS.lists(),
            });
        },
    });
};

// Calculate academic year statistics
export const useAcademicYearStats = () => {
    const { data: academicYears = [], isLoading } = useAllAcademicYears();
    const stats: AcademicYearStats = {
        totalAcademicYears: academicYears.length,
        totalSemesters: academicYears.reduce(
            (acc, year) => acc + (year._count?.semesters || 0),
            0
        ),
        totalSubjectAllocations: academicYears.reduce(
            (acc, year) => acc + (year._count?.subjectAllocations || 0),
            0
        ),
        currentYear: getCurrentAcademicYear(academicYears),
    };
    return { stats, isLoading };
};

// Fetch the active academic year
export const useActiveAcademicYear = () => {
    return useQuery<AcademicYear | null, Error>({
        queryKey: ACADEMIC_YEAR_QUERY_KEYS.active(),
        queryFn: () => academicYearService.getActiveAcademicYear(),
        staleTime: 5 * 60 * 1000,
    });
};

// Get the current academic year
const getCurrentAcademicYear = (
    academicYears: AcademicYear[]
): AcademicYear | null => {
    return academicYears.find((year) => year.isActive) || null;
};

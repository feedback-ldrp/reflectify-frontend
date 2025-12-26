// src/hooks/useSemesters.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import semesterService from "@/services/semesterService"; // Adjust path
import {
  Semester,
  CreateSemesterData,
  UpdateSemesterData,
  GetSemestersFilters,
} from "@/interfaces/semester"; // Adjust path
import { IdType } from "@/interfaces/common"; // Adjust path
/**
@file src/hooks/useSemesters.ts
@description React Query hooks for semester data management
*/

// Query keys
export const SEMESTER_QUERY_KEYS = {
  all: ["semesters"] as const,
  lists: (filters?: GetSemestersFilters) =>
    [...SEMESTER_QUERY_KEYS.all, "list", filters] as const,
  detail: (id: IdType) => [...SEMESTER_QUERY_KEYS.all, id] as const,
  byDepartment: (departmentId: IdType) =>
    [...SEMESTER_QUERY_KEYS.all, "byDepartment", departmentId] as const,
};

// Get all semesters
export const useAllSemesters = ({
  filters,
  enabled = true,
}: { filters?: GetSemestersFilters; enabled?: boolean } = {}) =>
  useQuery<Semester[], Error>({
    queryKey: SEMESTER_QUERY_KEYS.lists(filters),
    queryFn: () => semesterService.getAllSemesters(filters),
    enabled,
  });

// Get semester by ID
export const useSemester = (id: IdType) =>
  useQuery<Semester, Error>({
    queryKey: SEMESTER_QUERY_KEYS.detail(id),
    queryFn: () => semesterService.getSemesterById(id),
    enabled: !!id,
  });

// Get semesters by department ID
export const useSemestersByDepartmentId = ({
  departmentId,
  enabled = true,
}: {
  departmentId: IdType;
  enabled?: boolean;
}) =>
  useQuery<Semester[], Error>({
    queryKey: SEMESTER_QUERY_KEYS.byDepartment(departmentId),
    queryFn: () => semesterService.getSemestersByDepartmentId(departmentId),
    enabled: enabled && !!departmentId,
  });

// Create semester
export const useCreateSemester = () => {
  const queryClient = useQueryClient();
  return useMutation<Semester, Error, CreateSemesterData>({
    mutationFn: semesterService.createSemester,
    onSuccess: (newSemester) => {
      queryClient.invalidateQueries({
        queryKey: SEMESTER_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: SEMESTER_QUERY_KEYS.byDepartment(newSemester.departmentId),
      });
    },
  });
};

// Update semester with optimistic update
export const useUpdateSemester = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Semester,
    Error,
    { id: IdType; data: UpdateSemesterData },
    {
      previousSemester: Semester | undefined;
      previousSemestersList: Semester[] | undefined;
      previousDeptSemestersList: Semester[] | undefined;
    }
  >({
    mutationFn: ({ id, data }) => semesterService.updateSemester(id, data),
    onSuccess: (updatedSemester) => {
      queryClient.invalidateQueries({
        queryKey: SEMESTER_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: SEMESTER_QUERY_KEYS.detail(updatedSemester.id),
      });
      queryClient.invalidateQueries({
        queryKey: SEMESTER_QUERY_KEYS.byDepartment(
          updatedSemester.departmentId,
        ),
      });
      queryClient.setQueryData<Semester>(
        SEMESTER_QUERY_KEYS.detail(updatedSemester.id),
        updatedSemester,
      );
    },
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({
        queryKey: SEMESTER_QUERY_KEYS.detail(id),
      });
      await queryClient.cancelQueries({
        queryKey: SEMESTER_QUERY_KEYS.all,
      });
      const previousSemester = queryClient.getQueryData<Semester>(
        SEMESTER_QUERY_KEYS.detail(id),
      );
      if (previousSemester?.departmentId) {
        await queryClient.cancelQueries({
          queryKey: SEMESTER_QUERY_KEYS.byDepartment(
            previousSemester.departmentId,
          ),
        });
      }
      const previousSemestersList = queryClient.getQueryData<Semester[]>(
        SEMESTER_QUERY_KEYS.all,
      );
      const previousDeptSemestersList = previousSemester?.departmentId
        ? queryClient.getQueryData<Semester[]>(
            SEMESTER_QUERY_KEYS.byDepartment(previousSemester.departmentId),
          )
        : undefined;
      queryClient.setQueryData<Semester>(
        SEMESTER_QUERY_KEYS.detail(id),
        (old) => (old ? { ...old, ...updateData } : old),
      );
      queryClient.setQueryData<Semester[]>(SEMESTER_QUERY_KEYS.all, (old) =>
        old?.map((sem) => (sem.id === id ? { ...sem, ...updateData } : sem)),
      );
      if (previousSemester?.departmentId) {
        queryClient.setQueryData<Semester[]>(
          SEMESTER_QUERY_KEYS.byDepartment(previousSemester.departmentId),
          (old) =>
            old?.map((sem) =>
              sem.id === id ? { ...sem, ...updateData } : sem,
            ),
        );
      }
      return {
        previousSemester,
        previousSemestersList,
        previousDeptSemestersList,
      };
    },
    onError: (_err, variables, context) => {
      if (context?.previousSemester) {
        queryClient.setQueryData(
          SEMESTER_QUERY_KEYS.detail(variables.id),
          context.previousSemester,
        );
      }
      if (context?.previousSemestersList) {
        queryClient.setQueryData(
          SEMESTER_QUERY_KEYS.all,
          context.previousSemestersList,
        );
      }
      if (
        context?.previousDeptSemestersList &&
        context.previousSemester?.departmentId
      ) {
        queryClient.setQueryData(
          SEMESTER_QUERY_KEYS.byDepartment(
            context.previousSemester.departmentId,
          ),
          context.previousDeptSemestersList,
        );
      }
    },
    onSettled: (_data, _error, variables, context) => {
      const affectedDepartmentId = context?.previousSemester?.departmentId;
      queryClient.invalidateQueries({
        queryKey: SEMESTER_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: SEMESTER_QUERY_KEYS.all,
      });
      if (affectedDepartmentId) {
        queryClient.invalidateQueries({
          queryKey: SEMESTER_QUERY_KEYS.byDepartment(affectedDepartmentId),
        });
      }
    },
  });
};

// Soft delete semester with optimistic update
export const useSoftDeleteSemester = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    IdType,
    {
      previousSemestersList: Semester[] | undefined;
      previousDeptSemestersList: Semester[] | undefined;
      semesterToDelete: Semester | undefined;
    }
  >({
    mutationFn: (id) => semesterService.softDeleteSemester(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: SEMESTER_QUERY_KEYS.all,
      });
      queryClient.removeQueries({
        queryKey: SEMESTER_QUERY_KEYS.detail(id),
      });
    },
    onMutate: async (idToDelete) => {
      const semesterToDelete = queryClient.getQueryData<Semester>(
        SEMESTER_QUERY_KEYS.detail(idToDelete),
      );
      await queryClient.cancelQueries({
        queryKey: SEMESTER_QUERY_KEYS.all,
      });
      if (semesterToDelete?.departmentId) {
        await queryClient.cancelQueries({
          queryKey: SEMESTER_QUERY_KEYS.byDepartment(
            semesterToDelete.departmentId,
          ),
        });
      }
      const previousSemestersList = queryClient.getQueryData<Semester[]>(
        SEMESTER_QUERY_KEYS.all,
      );
      const previousDeptSemestersList = semesterToDelete?.departmentId
        ? queryClient.getQueryData<Semester[]>(
            SEMESTER_QUERY_KEYS.byDepartment(semesterToDelete.departmentId),
          )
        : undefined;
      queryClient.setQueryData<Semester[]>(SEMESTER_QUERY_KEYS.all, (old) =>
        old?.filter((sem) => sem.id !== idToDelete),
      );
      if (semesterToDelete?.departmentId) {
        queryClient.setQueryData<Semester[]>(
          SEMESTER_QUERY_KEYS.byDepartment(semesterToDelete.departmentId),
          (old) => old?.filter((sem) => sem.id !== idToDelete),
        );
      }
      return {
        previousSemestersList,
        previousDeptSemestersList,
        semesterToDelete,
      };
    },
    onError: (_err, _idToDelete, context) => {
      if (context?.previousSemestersList) {
        queryClient.setQueryData(
          SEMESTER_QUERY_KEYS.all,
          context.previousSemestersList,
        );
      }
      if (
        context?.previousDeptSemestersList &&
        context.semesterToDelete?.departmentId
      ) {
        queryClient.setQueryData(
          SEMESTER_QUERY_KEYS.byDepartment(
            context.semesterToDelete.departmentId,
          ),
          context.previousDeptSemestersList,
        );
      }
    },
    onSettled: (_data, _error, _idToDelete, context) => {
      const affectedDepartmentId = context?.semesterToDelete?.departmentId;
      queryClient.invalidateQueries({
        queryKey: SEMESTER_QUERY_KEYS.all,
      });
      if (affectedDepartmentId) {
        queryClient.invalidateQueries({
          queryKey: SEMESTER_QUERY_KEYS.byDepartment(affectedDepartmentId),
        });
      }
    },
  });
};

// Batch create semesters
export const useBatchCreateSemesters = () => {
  const queryClient = useQueryClient();
  return useMutation<Semester[], Error, CreateSemesterData[]>({
    mutationFn: semesterService.batchCreateSemesters,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SEMESTER_QUERY_KEYS.all,
      });
    },
  });
};

/**
@file src/hooks/useDepartments.ts
@description React Query hooks for department data management
*/

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import departmentService from "@/services/departmentService";
import {
  Department,
  CreateDepartmentData,
  UpdateDepartmentData,
} from "@/interfaces/department";
import { IdType } from "@/interfaces/common";

// Query keys
export const DEPARTMENT_QUERY_KEYS = {
  all: ["departments"] as const,
  lists: () => [...DEPARTMENT_QUERY_KEYS.all, "list"] as const,
  detail: (id: IdType) => [...DEPARTMENT_QUERY_KEYS.all, id] as const,
};

// Get all departments
export const useAllDepartments = () =>
  useQuery<Department[], Error>({
    queryKey: DEPARTMENT_QUERY_KEYS.lists(),
    queryFn: departmentService.getAllDepartments,
  });

// Get department by ID
export const useDepartment = (id: IdType) =>
  useQuery<Department, Error>({
    queryKey: DEPARTMENT_QUERY_KEYS.detail(id),
    queryFn: () => departmentService.getDepartmentById(id),
    enabled: !!id,
  });

// Create department
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation<Department, Error, CreateDepartmentData>({
    mutationFn: departmentService.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.lists(),
      });
    },
  });
};

// Update department with optimistic update
export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Department,
    Error,
    { id: IdType; data: UpdateDepartmentData },
    {
      previousDepartment: Department | undefined;
      previousDepartmentsList: Department[] | undefined;
    }
  >({
    mutationFn: ({ id, data }) => departmentService.updateDepartment(id, data),
    onSuccess: (updatedDepartment) => {
      queryClient.invalidateQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.detail(updatedDepartment.id),
      });
      queryClient.setQueryData<Department>(
        DEPARTMENT_QUERY_KEYS.detail(updatedDepartment.id),
        updatedDepartment,
      );
    },
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.detail(id),
      });
      await queryClient.cancelQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.lists(),
      });
      const previousDepartment = queryClient.getQueryData<Department>(
        DEPARTMENT_QUERY_KEYS.detail(id),
      );
      const previousDepartmentsList = queryClient.getQueryData<Department[]>(
        DEPARTMENT_QUERY_KEYS.lists(),
      );
      queryClient.setQueryData<Department>(
        DEPARTMENT_QUERY_KEYS.detail(id),
        (old) => (old ? { ...old, ...updateData } : old),
      );
      queryClient.setQueryData<Department[]>(
        DEPARTMENT_QUERY_KEYS.lists(),
        (old) =>
          old?.map((dept) =>
            dept.id === id ? { ...dept, ...updateData } : dept,
          ),
      );
      return { previousDepartment, previousDepartmentsList };
    },
    onError: (_err, variables, context) => {
      if (context?.previousDepartment) {
        queryClient.setQueryData(
          DEPARTMENT_QUERY_KEYS.detail(variables.id),
          context.previousDepartment,
        );
      }
      if (context?.previousDepartmentsList) {
        queryClient.setQueryData(
          DEPARTMENT_QUERY_KEYS.lists(),
          context.previousDepartmentsList,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.lists(),
      });
    },
  });
};

// Soft delete department with optimistic update
export const useSoftDeleteDepartment = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    IdType,
    { previousDepartmentsList: Department[] | undefined }
  >({
    mutationFn: (id) => departmentService.softDeleteDepartment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.lists(),
      });
      queryClient.removeQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.detail(id),
      });
    },
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.lists(),
      });
      const previousDepartmentsList = queryClient.getQueryData<Department[]>(
        DEPARTMENT_QUERY_KEYS.lists(),
      );
      queryClient.setQueryData<Department[]>(
        DEPARTMENT_QUERY_KEYS.lists(),
        (old) => old?.filter((dept) => dept.id !== idToDelete),
      );
      return { previousDepartmentsList };
    },
    onError: (_err, _idToDelete, context) => {
      if (context?.previousDepartmentsList) {
        queryClient.setQueryData(
          DEPARTMENT_QUERY_KEYS.lists(),
          context.previousDepartmentsList,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.lists(),
      });
    },
  });
};

// Batch create departments
export const useBatchCreateDepartments = () => {
  const queryClient = useQueryClient();
  return useMutation<Department[], Error, CreateDepartmentData[]>({
    mutationFn: departmentService.batchCreateDepartments,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DEPARTMENT_QUERY_KEYS.lists(),
      });
    },
  });
};

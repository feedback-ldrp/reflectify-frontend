/**
@file src/hooks/useDivisions.ts
@description React Query hooks for division data management
*/

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import divisionService from "@/services/divisionService";
import {
  Division,
  CreateDivisionData,
  UpdateDivisionData,
} from "@/interfaces/division";
import { IdType } from "@/interfaces/common";

// Query keys
export const DIVISION_QUERY_KEYS = {
  all: ["divisions"] as const,
  lists: (departmentId?: IdType, semesterId?: IdType) =>
    [...DIVISION_QUERY_KEYS.all, "list", departmentId, semesterId] as const,
  detail: (id: IdType) => [...DIVISION_QUERY_KEYS.all, id] as const,
};

// Get all divisions
interface UseAllDivisionsParams {
  departmentId?: IdType;
  semesterId?: IdType;
  enabled?: boolean;
}
export const useAllDivisions = ({
  departmentId,
  semesterId,
  enabled = true,
}: UseAllDivisionsParams = {}) =>
  useQuery<Division[], Error>({
    queryKey: DIVISION_QUERY_KEYS.lists(departmentId, semesterId),
    queryFn: () => divisionService.getAllDivisions(departmentId, semesterId),
    enabled,
  });

// Get division by ID
export const useDivision = (id: IdType) =>
  useQuery<Division, Error>({
    queryKey: DIVISION_QUERY_KEYS.detail(id),
    queryFn: () => divisionService.getDivisionById(id),
    enabled: !!id,
  });

// Create division
export const useCreateDivision = () => {
  const queryClient = useQueryClient();
  return useMutation<Division, Error, CreateDivisionData>({
    mutationFn: divisionService.createDivision,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DIVISION_QUERY_KEYS.all,
      });
    },
  });
};

// Update division with optimistic update
export const useUpdateDivision = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Division,
    Error,
    { id: IdType; data: UpdateDivisionData },
    {
      previousDivision: Division | undefined;
      previousDivisionsList: Division[] | undefined;
    }
  >({
    mutationFn: ({ id, data }) => divisionService.updateDivision(id, data),
    onSuccess: (updatedDivision) => {
      queryClient.invalidateQueries({
        queryKey: DIVISION_QUERY_KEYS.all,
      });
      queryClient.invalidateQueries({
        queryKey: DIVISION_QUERY_KEYS.detail(updatedDivision.id),
      });
      queryClient.setQueryData<Division>(
        DIVISION_QUERY_KEYS.detail(updatedDivision.id),
        updatedDivision,
      );
    },
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({
        queryKey: DIVISION_QUERY_KEYS.detail(id),
      });
      await queryClient.cancelQueries({
        queryKey: DIVISION_QUERY_KEYS.all,
      });
      const previousDivision = queryClient.getQueryData<Division>(
        DIVISION_QUERY_KEYS.detail(id),
      );
      const previousDivisionsList = queryClient.getQueryData<Division[]>(
        DIVISION_QUERY_KEYS.all,
      );
      queryClient.setQueryData<Division>(
        DIVISION_QUERY_KEYS.detail(id),
        (old) => (old ? { ...old, ...updateData } : old),
      );
      queryClient.setQueryData<Division[]>(DIVISION_QUERY_KEYS.all, (old) =>
        old?.map((div) => (div.id === id ? { ...div, ...updateData } : div)),
      );
      return { previousDivision, previousDivisionsList };
    },
    onError: (_err, variables, context) => {
      if (context?.previousDivision) {
        queryClient.setQueryData(
          DIVISION_QUERY_KEYS.detail(variables.id),
          context.previousDivision,
        );
      }
      if (context?.previousDivisionsList) {
        queryClient.setQueryData(
          DIVISION_QUERY_KEYS.all,
          context.previousDivisionsList,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: DIVISION_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: DIVISION_QUERY_KEYS.all,
      });
    },
  });
};

// Soft delete division with optimistic update
export const useSoftDeleteDivision = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    IdType,
    { previousDivisionsList: Division[] | undefined }
  >({
    mutationFn: (id) => divisionService.softDeleteDivision(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: DIVISION_QUERY_KEYS.all,
      });
      queryClient.removeQueries({
        queryKey: DIVISION_QUERY_KEYS.detail(id),
      });
    },
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({
        queryKey: DIVISION_QUERY_KEYS.all,
      });
      const previousDivisionsList = queryClient.getQueryData<Division[]>(
        DIVISION_QUERY_KEYS.all,
      );
      queryClient.setQueryData<Division[]>(DIVISION_QUERY_KEYS.all, (old) =>
        old?.filter((div) => div.id !== idToDelete),
      );
      return { previousDivisionsList };
    },
    onError: (_err, _idToDelete, context) => {
      if (context?.previousDivisionsList) {
        queryClient.setQueryData(
          DIVISION_QUERY_KEYS.all,
          context.previousDivisionsList,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: DIVISION_QUERY_KEYS.all,
      });
    },
  });
};

// Batch create divisions
export const useBatchCreateDivisions = () => {
  const queryClient = useQueryClient();
  return useMutation<Division[], Error, CreateDivisionData[]>({
    mutationFn: divisionService.batchCreateDivisions,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DIVISION_QUERY_KEYS.all,
      });
    },
  });
};

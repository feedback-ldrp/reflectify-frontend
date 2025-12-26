/**
 * @file src/hooks/useColleges.ts
 * @description React Query hooks for managing college data.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import collegeService from "@/services/collegeService";
import {
  College,
  CreateCollegeData,
  UpdateCollegeData,
} from "@/interfaces/college";

// Query keys for college-related queries
export const COLLEGE_QUERY_KEYS = {
  all: ["colleges"] as const,
  primary: () => [...COLLEGE_QUERY_KEYS.all, "primary"] as const,
};

// Fetch all colleges
export const useAllColleges = () =>
  useQuery<College[], Error>({
    queryKey: COLLEGE_QUERY_KEYS.all,
    queryFn: collegeService.getAllColleges,
  });

// Fetch the primary college
export const usePrimaryCollege = () =>
  useQuery<College, Error>({
    queryKey: COLLEGE_QUERY_KEYS.primary(),
    queryFn: collegeService.getPrimaryCollege,
  });

// Create or update the primary college
export const useUpsertPrimaryCollege = () => {
  const queryClient = useQueryClient();
  return useMutation<College, Error, CreateCollegeData>({
    mutationFn: collegeService.upsertPrimaryCollege,
    onSuccess: (college) => {
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: COLLEGE_QUERY_KEYS.primary(),
      });
      queryClient.setQueryData(COLLEGE_QUERY_KEYS.primary(), college);
    },
  });
};

// Update the primary college with optimistic updates
export const useUpdatePrimaryCollege = () => {
  const queryClient = useQueryClient();
  return useMutation<
    College,
    Error,
    UpdateCollegeData,
    {
      previousPrimaryCollege: College | undefined;
      previousAllColleges: College[] | undefined;
    }
  >({
    mutationFn: collegeService.updatePrimaryCollege,
    onSuccess: (college) => {
      queryClient.invalidateQueries({
        queryKey: COLLEGE_QUERY_KEYS.primary(),
      });
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
      queryClient.setQueryData(COLLEGE_QUERY_KEYS.primary(), college);
    },
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({
        queryKey: COLLEGE_QUERY_KEYS.primary(),
      });
      await queryClient.cancelQueries({
        queryKey: COLLEGE_QUERY_KEYS.all,
      });
      const previousPrimaryCollege = queryClient.getQueryData<College>(
        COLLEGE_QUERY_KEYS.primary(),
      );
      const previousAllColleges = queryClient.getQueryData<College[]>(
        COLLEGE_QUERY_KEYS.all,
      );
      queryClient.setQueryData<College>(COLLEGE_QUERY_KEYS.primary(), (old) =>
        old ? { ...old, ...updateData } : old,
      );
      if (previousPrimaryCollege?.id) {
        queryClient.setQueryData<College[]>(COLLEGE_QUERY_KEYS.all, (old) =>
          old?.map((college) =>
            college.id === previousPrimaryCollege.id
              ? { ...college, ...updateData }
              : college,
          ),
        );
      }
      return { previousPrimaryCollege, previousAllColleges };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPrimaryCollege) {
        queryClient.setQueryData(
          COLLEGE_QUERY_KEYS.primary(),
          context.previousPrimaryCollege,
        );
      }
      if (context?.previousAllColleges) {
        queryClient.setQueryData(
          COLLEGE_QUERY_KEYS.all,
          context.previousAllColleges,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: COLLEGE_QUERY_KEYS.primary(),
      });
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
    },
  });
};

// Soft delete the primary college with optimistic updates
export const useSoftDeletePrimaryCollege = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    void,
    {
      previousPrimaryCollege: College | undefined;
      previousAllColleges: College[] | undefined;
    }
  >({
    mutationFn: collegeService.softDeletePrimaryCollege,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: COLLEGE_QUERY_KEYS.primary(),
      });
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
      queryClient.removeQueries({
        queryKey: COLLEGE_QUERY_KEYS.primary(),
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: COLLEGE_QUERY_KEYS.primary(),
      });
      await queryClient.cancelQueries({
        queryKey: COLLEGE_QUERY_KEYS.all,
      });
      const previousPrimaryCollege = queryClient.getQueryData<College>(
        COLLEGE_QUERY_KEYS.primary(),
      );
      const previousAllColleges = queryClient.getQueryData<College[]>(
        COLLEGE_QUERY_KEYS.all,
      );
      queryClient.setQueryData<College>(
        COLLEGE_QUERY_KEYS.primary(),
        undefined,
      );
      if (previousPrimaryCollege?.id) {
        queryClient.setQueryData<College[]>(COLLEGE_QUERY_KEYS.all, (old) =>
          old?.filter((college) => college.id !== previousPrimaryCollege.id),
        );
      }
      return { previousPrimaryCollege, previousAllColleges };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPrimaryCollege) {
        queryClient.setQueryData(
          COLLEGE_QUERY_KEYS.primary(),
          context.previousPrimaryCollege,
        );
      }
      if (context?.previousAllColleges) {
        queryClient.setQueryData(
          COLLEGE_QUERY_KEYS.all,
          context.previousAllColleges,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: COLLEGE_QUERY_KEYS.primary(),
      });
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
    },
  });
};

// Batch update the primary college with optimistic updates
export const useBatchUpdatePrimaryCollege = () => {
  const queryClient = useQueryClient();
  return useMutation<
    College,
    Error,
    UpdateCollegeData,
    {
      previousPrimaryCollege: College | undefined;
      previousAllColleges: College[] | undefined;
    }
  >({
    mutationFn: collegeService.batchUpdatePrimaryCollege,
    onSuccess: (college) => {
      queryClient.invalidateQueries({
        queryKey: COLLEGE_QUERY_KEYS.primary(),
      });
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
      queryClient.setQueryData(COLLEGE_QUERY_KEYS.primary(), college);
    },
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({
        queryKey: COLLEGE_QUERY_KEYS.primary(),
      });
      await queryClient.cancelQueries({
        queryKey: COLLEGE_QUERY_KEYS.all,
      });
      const previousPrimaryCollege = queryClient.getQueryData<College>(
        COLLEGE_QUERY_KEYS.primary(),
      );
      const previousAllColleges = queryClient.getQueryData<College[]>(
        COLLEGE_QUERY_KEYS.all,
      );
      queryClient.setQueryData<College>(COLLEGE_QUERY_KEYS.primary(), (old) =>
        old ? { ...old, ...updateData } : old,
      );
      if (previousPrimaryCollege?.id) {
        queryClient.setQueryData<College[]>(COLLEGE_QUERY_KEYS.all, (old) =>
          old?.map((college) =>
            college.id === previousPrimaryCollege.id
              ? { ...college, ...updateData }
              : college,
          ),
        );
      }
      return { previousPrimaryCollege, previousAllColleges };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousPrimaryCollege) {
        queryClient.setQueryData(
          COLLEGE_QUERY_KEYS.primary(),
          context.previousPrimaryCollege,
        );
      }
      if (context?.previousAllColleges) {
        queryClient.setQueryData(
          COLLEGE_QUERY_KEYS.all,
          context.previousAllColleges,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: COLLEGE_QUERY_KEYS.primary(),
      });
      queryClient.invalidateQueries({ queryKey: COLLEGE_QUERY_KEYS.all });
    },
  });
};

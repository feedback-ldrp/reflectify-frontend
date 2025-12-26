/**
@file src/hooks/useSubjects.ts
@description React Query hooks for subjects
*/

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import subjectService from "@/services/subjectService"; // Adjust path
import {
  Subject,
  CreateSubjectData,
  UpdateSubjectData,
  SubjectAbbreviation,
} from "@/interfaces/subject"; // Adjust path
import { IdType } from "@/interfaces/common"; // Adjust path

// Query keys for subjects
export const SUBJECT_QUERY_KEYS = {
  all: ["subjects"] as const,
  lists: () => [...SUBJECT_QUERY_KEYS.all, "list"] as const,
  detail: (id: IdType) => [...SUBJECT_QUERY_KEYS.all, id] as const,
  bySemester: (semesterId: IdType) =>
    [...SUBJECT_QUERY_KEYS.all, "bySemester", semesterId] as const,
  abbreviations: (deptAbbr?: string) =>
    [...SUBJECT_QUERY_KEYS.all, "abbreviations", deptAbbr] as const,
};

// Get all subjects
export const useAllSubjects = () => {
  return useQuery<Subject[], Error>({
    queryKey: SUBJECT_QUERY_KEYS.lists(),
    queryFn: subjectService.getAllSubjects,
  });
};

// Get subject by ID
export const useSubject = (id: IdType) => {
  return useQuery<Subject, Error>({
    queryKey: SUBJECT_QUERY_KEYS.detail(id),
    queryFn: () => subjectService.getSubjectById(id),
    enabled: !!id,
  });
};

// Get subjects by semester ID
interface UseSubjectsBySemesterParams {
  semesterId: IdType;
  enabled?: boolean;
}
export const useSubjectsBySemester = ({
  semesterId,
  enabled = true,
}: UseSubjectsBySemesterParams) => {
  return useQuery<Subject[], Error>({
    queryKey: SUBJECT_QUERY_KEYS.bySemester(semesterId),
    queryFn: () => subjectService.getSubjectsBySemester(semesterId),
    enabled: enabled && !!semesterId, // Only run if semesterId is provided and enabled
  });
};

// Get subject abbreviations
interface UseSubjectAbbreviationsParams {
  deptAbbr?: string;
  enabled?: boolean;
}
export const useSubjectAbbreviations = ({
  deptAbbr,
  enabled = true,
}: UseSubjectAbbreviationsParams = {}) => {
  return useQuery<SubjectAbbreviation[], Error>({
    queryKey: SUBJECT_QUERY_KEYS.abbreviations(deptAbbr),
    queryFn: () => subjectService.getSubjectAbbreviations(deptAbbr),
    enabled: enabled,
  });
};

// Create subject
export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation<Subject, Error, CreateSubjectData>({
    mutationFn: subjectService.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.abbreviations(),
      });
    },
  });
};

// Update subject
export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Subject, // TData: Expected return type on success
    Error, // TError: Expected error type
    { id: IdType; data: UpdateSubjectData }, // TVariables: Type of the variables passed to mutate
    // TContext: Type of the context object returned by onMutate
    {
      previousSubject: Subject | undefined;
      previousSubjectsList: Subject[] | undefined;
    }
  >({
    mutationFn: ({ id, data }) => subjectService.updateSubject(id, data),
    onSuccess: (updatedSubject) => {
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.detail(updatedSubject.id),
      });
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.abbreviations(),
      });
      queryClient.setQueryData<Subject>(
        SUBJECT_QUERY_KEYS.detail(updatedSubject.id),
        updatedSubject,
      );
    },
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({
        queryKey: SUBJECT_QUERY_KEYS.detail(id),
      });
      await queryClient.cancelQueries({
        queryKey: SUBJECT_QUERY_KEYS.lists(),
      });
      await queryClient.cancelQueries({
        queryKey: SUBJECT_QUERY_KEYS.abbreviations(),
      });
      const previousSubject = queryClient.getQueryData<Subject>(
        SUBJECT_QUERY_KEYS.detail(id),
      );
      const previousSubjectsList = queryClient.getQueryData<Subject[]>(
        SUBJECT_QUERY_KEYS.lists(),
      );
      queryClient.setQueryData<Subject>(SUBJECT_QUERY_KEYS.detail(id), (old) =>
        old ? { ...old, ...updateData } : old,
      );
      queryClient.setQueryData<Subject[]>(SUBJECT_QUERY_KEYS.lists(), (old) =>
        old?.map((subject) =>
          subject.id === id ? { ...subject, ...updateData } : subject,
        ),
      );
      return { previousSubject, previousSubjectsList };
    },
    onError: (_err, variables, context) => {
      if (context?.previousSubject) {
        queryClient.setQueryData(
          SUBJECT_QUERY_KEYS.detail(variables.id),
          context.previousSubject,
        );
      }
      if (context?.previousSubjectsList) {
        queryClient.setQueryData(
          SUBJECT_QUERY_KEYS.lists(),
          context.previousSubjectsList,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.abbreviations(),
      });
    },
  });
};

// Soft delete subject
export const useSoftDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void, // TData
    Error, // TError
    IdType, // TVariables
    // TContext
    { previousSubjectsList: Subject[] | undefined }
  >({
    mutationFn: (id) => subjectService.softDeleteSubject(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.abbreviations(),
      });
      queryClient.removeQueries({
        queryKey: SUBJECT_QUERY_KEYS.detail(id),
      });
    },
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({
        queryKey: SUBJECT_QUERY_KEYS.lists(),
      });
      await queryClient.cancelQueries({
        queryKey: SUBJECT_QUERY_KEYS.abbreviations(),
      });
      const previousSubjectsList = queryClient.getQueryData<Subject[]>(
        SUBJECT_QUERY_KEYS.lists(),
      );
      queryClient.setQueryData<Subject[]>(SUBJECT_QUERY_KEYS.lists(), (old) =>
        old?.filter((subject) => subject.id !== idToDelete),
      );
      return { previousSubjectsList };
    },
    onError: (_err, _idToDelete, context) => {
      if (context?.previousSubjectsList) {
        queryClient.setQueryData(
          SUBJECT_QUERY_KEYS.lists(),
          context.previousSubjectsList,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.abbreviations(),
      });
    },
  });
};

// Batch create subjects
export const useBatchCreateSubjects = () => {
  const queryClient = useQueryClient();
  return useMutation<Subject[], Error, CreateSubjectData[]>({
    mutationFn: subjectService.batchCreateSubjects,
    onSuccess: () => {
      // Invalidate the list of subjects and abbreviations to refetch them after batch creation
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: SUBJECT_QUERY_KEYS.abbreviations(),
      });
    },
    // No optimistic update for batch create unless you have a robust temporary ID strategy
  });
};

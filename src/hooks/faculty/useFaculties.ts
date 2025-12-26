/**
@file src/hooks/faculty/useFaculties.ts
@description React Query hooks for faculty data management (CRUD, abbreviations, batch, etc.)
*/

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import facultyService from "@/services/facultyService";
import {
  Faculty,
  CreateFacultyData,
  UpdateFacultyData,
  FacultyAbbreviation,
} from "@/interfaces/faculty";
import { IdType } from "@/interfaces/common";

// Query keys for faculty-related queries
export const FACULTY_QUERY_KEYS = {
  all: ["faculties"] as const,
  lists: () => [...FACULTY_QUERY_KEYS.all, "list"] as const,
  detail: (id: IdType) => [...FACULTY_QUERY_KEYS.all, id] as const,
  abbreviations: (deptAbbr?: string) =>
    [...FACULTY_QUERY_KEYS.all, "abbreviations", deptAbbr] as const,
};

// Fetch all faculties
export const useAllFaculties = () => {
  return useQuery<Faculty[], Error>({
    queryKey: FACULTY_QUERY_KEYS.lists(),
    queryFn: facultyService.getAllFaculties,
  });
};

// Fetch a single faculty by ID
export const useFaculty = (id: IdType) => {
  return useQuery<Faculty, Error>({
    queryKey: FACULTY_QUERY_KEYS.detail(id),
    queryFn: () => facultyService.getFacultyById(id),
    enabled: !!id,
  });
};

// Fetch faculty abbreviations (optionally by department)
interface UseFacultyAbbreviationsParams {
  deptAbbr?: string;
  enabled?: boolean;
}
export const useFacultyAbbreviations = ({
  deptAbbr,
  enabled = true,
}: UseFacultyAbbreviationsParams = {}) => {
  return useQuery<FacultyAbbreviation[], Error>({
    queryKey: FACULTY_QUERY_KEYS.abbreviations(deptAbbr),
    queryFn: () => facultyService.getFacultyAbbreviations(deptAbbr),
    enabled,
  });
};

// Create a new faculty
export const useCreateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation<Faculty, Error, CreateFacultyData>({
    mutationFn: facultyService.createFaculty,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.abbreviations(),
      });
    },
  });
};

// Update an existing faculty
export const useUpdateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Faculty,
    Error,
    { id: IdType; data: UpdateFacultyData },
    {
      previousFaculty: Faculty | undefined;
      previousFacultiesList: Faculty[] | undefined;
    }
  >({
    mutationFn: ({ id, data }) => facultyService.updateFaculty(id, data),
    onSuccess: (updatedFaculty) => {
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.detail(updatedFaculty.id),
      });
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.abbreviations(),
      });
      queryClient.setQueryData<Faculty>(
        FACULTY_QUERY_KEYS.detail(updatedFaculty.id),
        updatedFaculty,
      );
    },
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({
        queryKey: FACULTY_QUERY_KEYS.detail(id),
      });
      await queryClient.cancelQueries({
        queryKey: FACULTY_QUERY_KEYS.lists(),
      });
      await queryClient.cancelQueries({
        queryKey: FACULTY_QUERY_KEYS.abbreviations(),
      });
      const previousFaculty = queryClient.getQueryData<Faculty>(
        FACULTY_QUERY_KEYS.detail(id),
      );
      const previousFacultiesList = queryClient.getQueryData<Faculty[]>(
        FACULTY_QUERY_KEYS.lists(),
      );
      queryClient.setQueryData<Faculty>(FACULTY_QUERY_KEYS.detail(id), (old) =>
        old ? { ...old, ...updateData } : old,
      );
      queryClient.setQueryData<Faculty[]>(FACULTY_QUERY_KEYS.lists(), (old) =>
        old?.map((faculty) =>
          faculty.id === id ? { ...faculty, ...updateData } : faculty,
        ),
      );
      return { previousFaculty, previousFacultiesList };
    },
    onError: (_err, variables, context) => {
      if (context?.previousFaculty) {
        queryClient.setQueryData(
          FACULTY_QUERY_KEYS.detail(variables.id),
          context.previousFaculty,
        );
      }
      if (context?.previousFacultiesList) {
        queryClient.setQueryData(
          FACULTY_QUERY_KEYS.lists(),
          context.previousFacultiesList,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.abbreviations(),
      });
    },
  });
};

// Soft delete a faculty
export const useSoftDeleteFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    IdType,
    { previousFacultiesList: Faculty[] | undefined }
  >({
    mutationFn: (id) => facultyService.softDeleteFaculty(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.abbreviations(),
      });
      queryClient.removeQueries({
        queryKey: FACULTY_QUERY_KEYS.detail(id),
      });
    },
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({
        queryKey: FACULTY_QUERY_KEYS.lists(),
      });
      await queryClient.cancelQueries({
        queryKey: FACULTY_QUERY_KEYS.abbreviations(),
      });
      const previousFacultiesList = queryClient.getQueryData<Faculty[]>(
        FACULTY_QUERY_KEYS.lists(),
      );
      queryClient.setQueryData<Faculty[]>(FACULTY_QUERY_KEYS.lists(), (old) =>
        old?.filter((faculty) => faculty.id !== idToDelete),
      );
      return { previousFacultiesList };
    },
    onError: (_err, _idToDelete, context) => {
      if (context?.previousFacultiesList) {
        queryClient.setQueryData(
          FACULTY_QUERY_KEYS.lists(),
          context.previousFacultiesList,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.abbreviations(),
      });
    },
  });
};

// Batch create faculties
export const useBatchCreateFaculties = () => {
  const queryClient = useQueryClient();
  return useMutation<Faculty[], Error, CreateFacultyData[]>({
    mutationFn: facultyService.batchCreateFaculties,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: FACULTY_QUERY_KEYS.abbreviations(),
      });
    },
  });
};

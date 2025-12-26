/**
@file src/hooks/useStudents.ts
@description React Query hooks for student data management
*/

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import studentService from "@/services/studentService";
import {
  Student,
  CreateStudentData,
  UpdateStudentData,
} from "@/interfaces/student";
import { IdType } from "@/interfaces/common";

// Query keys
export const STUDENT_QUERY_KEYS = {
  all: ["students"] as const,
  lists: () => [...STUDENT_QUERY_KEYS.all, "list"] as const,
  detail: (id: IdType) => [...STUDENT_QUERY_KEYS.all, id] as const,
};

// Get all students
export const useAllStudents = () =>
  useQuery<Student[], Error>({
    queryKey: STUDENT_QUERY_KEYS.lists(),
    queryFn: studentService.getAllStudents,
  });

// Get student by ID
export const useStudent = (id: IdType) =>
  useQuery<Student, Error>({
    queryKey: STUDENT_QUERY_KEYS.detail(id),
    queryFn: () => studentService.getStudentById(id),
    enabled: !!id,
  });

// Create student
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<Student, Error, CreateStudentData>({
    mutationFn: studentService.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_QUERY_KEYS.lists(),
      });
    },
  });
};

// Update student with optimistic update
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Student,
    Error,
    { id: IdType; data: UpdateStudentData },
    {
      previousStudent: Student | undefined;
      previousStudentsList: Student[] | undefined;
    }
  >({
    mutationFn: ({ id, data }) => studentService.updateStudent(id, data),
    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_QUERY_KEYS.detail(updatedStudent.id),
      });
      queryClient.setQueryData<Student>(
        STUDENT_QUERY_KEYS.detail(updatedStudent.id),
        updatedStudent,
      );
    },
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({
        queryKey: STUDENT_QUERY_KEYS.detail(id),
      });
      await queryClient.cancelQueries({
        queryKey: STUDENT_QUERY_KEYS.lists(),
      });
      const previousStudent = queryClient.getQueryData<Student>(
        STUDENT_QUERY_KEYS.detail(id),
      );
      const previousStudentsList = queryClient.getQueryData<Student[]>(
        STUDENT_QUERY_KEYS.lists(),
      );
      queryClient.setQueryData<Student>(STUDENT_QUERY_KEYS.detail(id), (old) =>
        old ? { ...old, ...updateData } : old,
      );
      queryClient.setQueryData<Student[]>(STUDENT_QUERY_KEYS.lists(), (old) =>
        old?.map((student) =>
          student.id === id ? { ...student, ...updateData } : student,
        ),
      );
      return { previousStudent, previousStudentsList };
    },
    onError: (_err, variables, context) => {
      if (context?.previousStudent) {
        queryClient.setQueryData(
          STUDENT_QUERY_KEYS.detail(variables.id),
          context.previousStudent,
        );
      }
      if (context?.previousStudentsList) {
        queryClient.setQueryData(
          STUDENT_QUERY_KEYS.lists(),
          context.previousStudentsList,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: STUDENT_QUERY_KEYS.lists(),
      });
    },
  });
};

// Soft delete student with optimistic update
export const useSoftDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    IdType,
    { previousStudentsList: Student[] | undefined }
  >({
    mutationFn: (id) => studentService.softDeleteStudent(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_QUERY_KEYS.lists(),
      });
      queryClient.removeQueries({
        queryKey: STUDENT_QUERY_KEYS.detail(id),
      });
    },
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({
        queryKey: STUDENT_QUERY_KEYS.lists(),
      });
      const previousStudentsList = queryClient.getQueryData<Student[]>(
        STUDENT_QUERY_KEYS.lists(),
      );
      queryClient.setQueryData<Student[]>(STUDENT_QUERY_KEYS.lists(), (old) =>
        old?.filter((student) => student.id !== idToDelete),
      );
      return { previousStudentsList };
    },
    onError: (_err, _idToDelete, context) => {
      if (context?.previousStudentsList) {
        queryClient.setQueryData(
          STUDENT_QUERY_KEYS.lists(),
          context.previousStudentsList,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_QUERY_KEYS.lists(),
      });
    },
  });
};

// Batch create students
export const useBatchCreateStudents = () => {
  const queryClient = useQueryClient();
  return useMutation<Student[], Error, CreateStudentData[]>({
    mutationFn: studentService.batchCreateStudents,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: STUDENT_QUERY_KEYS.lists(),
      });
    },
  });
};

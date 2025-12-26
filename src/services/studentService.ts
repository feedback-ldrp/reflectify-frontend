/**
 * @file src/services/studentService.ts
 * @description Service for student API operations
 */

import axiosInstance from "@/lib/axiosInstance";
import { STUDENT_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  Student,
  CreateStudentData,
  UpdateStudentData,
} from "@/interfaces/student";
import { ApiResponse, IdType } from "@/interfaces/common";

const studentService = {
  // Get all students
  getAllStudents: async (): Promise<Student[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ students: Student[] }>
    >(STUDENT_ENDPOINTS.BASE);
    return response.data.data.students;
  },

  // Get a single student by ID
  getStudentById: async (id: IdType): Promise<Student> => {
    const response = await axiosInstance.get<ApiResponse<{ student: Student }>>(
      STUDENT_ENDPOINTS.getById(id),
    );
    return response.data.data.student;
  },

  // Create a new student
  createStudent: async (studentData: CreateStudentData): Promise<Student> => {
    const response = await axiosInstance.post<
      ApiResponse<{ student: Student }>
    >(STUDENT_ENDPOINTS.BASE, studentData);
    return response.data.data.student;
  },

  // Update an existing student
  updateStudent: async (
    id: IdType,
    updateData: UpdateStudentData,
  ): Promise<Student> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ student: Student }>
    >(STUDENT_ENDPOINTS.getById(id), updateData);
    return response.data.data.student;
  },

  // Soft delete a student
  softDeleteStudent: async (id: IdType): Promise<void> => {
    await axiosInstance.delete(STUDENT_ENDPOINTS.getById(id));
  },

  // Batch create students
  batchCreateStudents: async (
    students: CreateStudentData[],
  ): Promise<Student[]> => {
    const response = await axiosInstance.post<
      ApiResponse<{ students: Student[] }>
    >(STUDENT_ENDPOINTS.BATCH, { students });
    return response.data.data.students;
  },
};

export default studentService;

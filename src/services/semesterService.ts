/**
 * @file src/services/semesterService.ts
 * @description Service for semester API operations
 */

import axiosInstance from "@/lib/axiosInstance";
import { SEMESTER_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  Semester,
  CreateSemesterData,
  UpdateSemesterData,
  GetSemestersFilters,
} from "@/interfaces/semester";
import { ApiResponse, IdType } from "@/interfaces/common";

const semesterService = {
  // Get all active semesters, optionally filtered
  getAllSemesters: async (
    filters?: GetSemestersFilters,
  ): Promise<Semester[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ semesters: Semester[] }>
    >(SEMESTER_ENDPOINTS.BASE, { params: filters });
    return response.data.data.semesters;
  },

  // Create a new semester
  createSemester: async (
    semesterData: CreateSemesterData,
  ): Promise<Semester> => {
    const response = await axiosInstance.post<
      ApiResponse<{ semester: Semester }>
    >(SEMESTER_ENDPOINTS.BASE, semesterData);
    return response.data.data.semester;
  },

  // Get a single semester by ID
  getSemesterById: async (id: IdType): Promise<Semester> => {
    const response = await axiosInstance.get<
      ApiResponse<{ semester: Semester }>
    >(SEMESTER_ENDPOINTS.getById(id));
    return response.data.data.semester;
  },

  // Update an existing semester
  updateSemester: async (
    id: IdType,
    updateData: UpdateSemesterData,
  ): Promise<Semester> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ semester: Semester }>
    >(SEMESTER_ENDPOINTS.getById(id), updateData);
    return response.data.data.semester;
  },

  // Soft delete a semester
  softDeleteSemester: async (id: IdType): Promise<void> => {
    await axiosInstance.delete(SEMESTER_ENDPOINTS.getById(id));
  },

  // Batch create semesters
  batchCreateSemesters: async (
    semesters: CreateSemesterData[],
  ): Promise<Semester[]> => {
    const response = await axiosInstance.post<
      ApiResponse<{ semesters: Semester[] }>
    >(SEMESTER_ENDPOINTS.BATCH, { semesters });
    return response.data.data.semesters;
  },

  // Get all active semesters for a specific department
  getSemestersByDepartmentId: async (
    departmentId: IdType,
  ): Promise<Semester[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ semesters: Semester[] }>
    >(SEMESTER_ENDPOINTS.GET_BY_DEPARTMENT(departmentId));
    return response.data.data.semesters;
  },
};

export default semesterService;

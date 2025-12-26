/**
 * @file src/services/facultyService.ts
 * @description Handles API requests related to faculties.
 */

import axiosInstance from "@/lib/axiosInstance";
import { FACULTY_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  Faculty,
  CreateFacultyData,
  UpdateFacultyData,
  FacultyAbbreviation,
} from "@/interfaces/faculty";
import { ApiResponse, IdType } from "@/interfaces/common";

const facultyService = {
  // Fetch all faculties
  getAllFaculties: async (): Promise<Faculty[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ faculties: Faculty[] }>
    >(FACULTY_ENDPOINTS.BASE);
    return response.data.data.faculties;
  },

  // Fetch a single faculty by ID
  getFacultyById: async (id: IdType): Promise<Faculty> => {
    const response = await axiosInstance.get<ApiResponse<{ faculty: Faculty }>>(
      FACULTY_ENDPOINTS.getById(id),
    );
    return response.data.data.faculty;
  },

  // Create a new faculty
  createFaculty: async (facultyData: CreateFacultyData): Promise<Faculty> => {
    const response = await axiosInstance.post<
      ApiResponse<{ faculty: Faculty }>
    >(FACULTY_ENDPOINTS.BASE, facultyData);
    return response.data.data.faculty;
  },

  // Update an existing faculty
  updateFaculty: async (
    id: IdType,
    updateData: UpdateFacultyData,
  ): Promise<Faculty> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ faculty: Faculty }>
    >(FACULTY_ENDPOINTS.getById(id), updateData);
    return response.data.data.faculty;
  },

  // Soft delete a faculty
  softDeleteFaculty: async (id: IdType): Promise<void> => {
    await axiosInstance.delete(FACULTY_ENDPOINTS.getById(id));
  },

  // Batch create faculties
  batchCreateFaculties: async (
    faculties: CreateFacultyData[],
  ): Promise<Faculty[]> => {
    const response = await axiosInstance.post<
      ApiResponse<{ faculties: Faculty[] }>
    >(FACULTY_ENDPOINTS.BATCH, { faculties });
    return response.data.data.faculties;
  },

  // Retrieve faculty abbreviations, optionally filtered by department abbreviation
  getFacultyAbbreviations: async (
    deptAbbr?: string,
  ): Promise<FacultyAbbreviation[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ abbreviations: FacultyAbbreviation[] }>
    >(FACULTY_ENDPOINTS.getAbbreviations(deptAbbr));
    return response.data.data.abbreviations;
  },
};

export default facultyService;

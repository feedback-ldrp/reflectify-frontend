/**
 * @file src/services/overrideStudentsService.ts
 * @description Service for override students API operations
 */

import axiosInstance from "@/lib/axiosInstance";
import { ApiResponse } from "@/interfaces/common";
import {
  OverrideStudent,
  OverrideStudentUploadResult as UploadOverrideStudentsResponse,
  PaginatedOverrideStudents,
} from "@/interfaces/overrideStudent";

const overrideStudentsService = {
  // Upload override students for a specific feedback form
  uploadOverrideStudents: async (
    formId: string,
    file: File,
  ): Promise<UploadOverrideStudentsResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post<
      ApiResponse<UploadOverrideStudentsResponse>
    >(`/api/v1/feedback-forms/${formId}/override-students/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  // Get override students for a feedback form with pagination
  getOverrideStudents: async (
    formId: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedOverrideStudents> => {
    const response = await axiosInstance.get<
      ApiResponse<PaginatedOverrideStudents>
    >(`/api/v1/feedback-forms/${formId}/override-students`, {
      params: { page, limit },
    });
    return response.data.data;
  },

  // Get the count of override students for a feedback form
  getOverrideStudentsCount: async (formId: string): Promise<number> => {
    const response = await axiosInstance.get<ApiResponse<{ count: number }>>(
      `/api/v1/feedback-forms/${formId}/override-students/count`,
    );
    return response.data.data.count;
  },

  // Get all override students for a feedback form without pagination
  getAllOverrideStudents: async (
    formId: string,
  ): Promise<OverrideStudent[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ students: OverrideStudent[] }>
    >(`/api/v1/feedback-forms/${formId}/override-students/all`);
    return response.data.data.students;
  },

  // Update a specific override student
  updateOverrideStudent: async (
    formId: string,
    studentId: string,
    updateData: Partial<Omit<OverrideStudent, "id" | "createdAt">>,
  ): Promise<OverrideStudent> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ student: OverrideStudent }>
    >(
      `/api/v1/feedback-forms/${formId}/override-students/${studentId}`,
      updateData,
    );
    return response.data.data.student;
  },

  // Delete a specific override student
  deleteOverrideStudent: async (
    formId: string,
    studentId: string,
  ): Promise<void> => {
    await axiosInstance.delete(
      `/api/v1/feedback-forms/${formId}/override-students/${studentId}`,
    );
  },

  // Clear all override students for a feedback form
  clearAllOverrideStudents: async (formId: string): Promise<number> => {
    const response = await axiosInstance.delete<
      ApiResponse<{ deletedCount: number }>
    >(`/api/v1/feedback-forms/${formId}/override-students`);
    return response.data.data.deletedCount;
  },
};

export default overrideStudentsService;

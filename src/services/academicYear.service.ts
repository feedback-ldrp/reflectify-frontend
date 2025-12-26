/**
 * @file src/services/academicYear.service.ts
 * @description Service for Academic Year API operations
 */

import apiClient from "@/lib/axiosInstance";
import { ACADEMIC_YEAR_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  AcademicYear,
  CreateAcademicYearData,
  UpdateAcademicYearData,
  AcademicYearApiResponse,
  AcademicYearsApiResponse,
} from "@/interfaces/academicYear";

export class AcademicYearService {
  // Get all academic years
  async getAllAcademicYears(): Promise<AcademicYear[]> {
    const response = await apiClient.get<AcademicYearsApiResponse>(
      ACADEMIC_YEAR_ENDPOINTS.BASE,
    );
    return response.data.data.academicYears;
  }

  // Get academic year by ID
  async getAcademicYearById(id: string): Promise<AcademicYear> {
    const response = await apiClient.get<AcademicYearApiResponse>(
      ACADEMIC_YEAR_ENDPOINTS.getById(id),
    );
    return response.data.data.academicYear;
  }

  // Create new academic year
  async createAcademicYear(
    data: CreateAcademicYearData,
  ): Promise<AcademicYear> {
    const response = await apiClient.post<AcademicYearApiResponse>(
      ACADEMIC_YEAR_ENDPOINTS.BASE,
      data,
    );
    return response.data.data.academicYear;
  }

  // Update academic year
  async updateAcademicYear(
    id: string,
    data: UpdateAcademicYearData,
  ): Promise<AcademicYear> {
    const response = await apiClient.patch<AcademicYearApiResponse>(
      ACADEMIC_YEAR_ENDPOINTS.getById(id),
      data,
    );
    return response.data.data.academicYear;
  }

  // Delete academic year (soft delete)
  async deleteAcademicYear(id: string): Promise<void> {
    await apiClient.delete(ACADEMIC_YEAR_ENDPOINTS.getById(id));
  }

  // Get the active academic year
  async getActiveAcademicYear(): Promise<AcademicYear | null> {
    try {
      const response = await apiClient.get<AcademicYearApiResponse>(
        ACADEMIC_YEAR_ENDPOINTS.ACTIVE,
      );
      return response.data.data.academicYear;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No active academic year found
      }
      throw error;
    }
  }
}

export const academicYearService = new AcademicYearService();

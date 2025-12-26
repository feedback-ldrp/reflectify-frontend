/**
 * @file src/services/academicStructure.service.ts
 * @description Service for Academic Structure API operations
 */
import axiosInstance from "@/lib/axiosInstance";
import { ACADEMIC_STRUCTURE_ENDPOINTS } from "@/constants/apiEndpoints";
import { ApiResponse } from "@/interfaces/common";
import {
  DepartmentWithAcademicStructure,
  AcademicStructureParams,
} from "@/interfaces/academicStructure";

interface AcademicStructureResponse {
  academicStructure: DepartmentWithAcademicStructure[];
}

const academicStructureService = {
  // Fetch the complete academic structure from the backend
  getAcademicStructure: async (
    params?: AcademicStructureParams,
  ): Promise<DepartmentWithAcademicStructure[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.academicYearId) {
        queryParams.append("academicYearId", params.academicYearId);
      }
      const url = `${ACADEMIC_STRUCTURE_ENDPOINTS.BASE}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response =
        await axiosInstance.get<ApiResponse<AcademicStructureResponse>>(url);
      return response.data.data.academicStructure;
    } catch (error) {
      throw error;
    }
  },

  // Fetch academic structure for a specific academic year
  getAcademicStructureByYear: async (
    academicYearId: string,
  ): Promise<DepartmentWithAcademicStructure[]> => {
    return academicStructureService.getAcademicStructure({
      academicYearId,
    });
  },
};

export default academicStructureService;

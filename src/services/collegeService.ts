/**
 * @file src/services/collegeService.ts
 * @description Service for College API operations
 */

import axiosInstance from "@/lib/axiosInstance";
import { COLLEGE_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  College,
  CreateCollegeData,
  UpdateCollegeData,
} from "@/interfaces/college";
import { ApiResponse } from "@/interfaces/common";

// Service for College API operations
const collegeService = {
  // Fetch all colleges
  getAllColleges: async (): Promise<College[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ colleges: College[] }>
    >(COLLEGE_ENDPOINTS.BASE);
    return response.data.data.colleges;
  },

  // Create or upsert the primary college
  upsertPrimaryCollege: async (
    collegeData: CreateCollegeData,
  ): Promise<College> => {
    const response = await axiosInstance.post<
      ApiResponse<{ college: College }>
    >(COLLEGE_ENDPOINTS.BASE, collegeData);
    return response.data.data.college;
  },

  // Retrieve the primary college
  getPrimaryCollege: async (): Promise<College> => {
    const response = await axiosInstance.get<ApiResponse<{ college: College }>>(
      COLLEGE_ENDPOINTS.PRIMARY,
    );
    return response.data.data.college;
  },

  // Update the primary college
  updatePrimaryCollege: async (
    updateData: UpdateCollegeData,
  ): Promise<College> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ college: College }>
    >(COLLEGE_ENDPOINTS.PRIMARY, updateData);
    return response.data.data.college;
  },

  // Soft delete the primary college
  softDeletePrimaryCollege: async (): Promise<void> => {
    await axiosInstance.delete(COLLEGE_ENDPOINTS.PRIMARY);
  },

  // Batch update the primary college
  batchUpdatePrimaryCollege: async (
    updates: UpdateCollegeData,
  ): Promise<College> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ college: College }>
    >(COLLEGE_ENDPOINTS.BATCH_UPDATE_PRIMARY, { updates });
    return response.data.data.college;
  },
};

export default collegeService;

/**
 * @file src/services/subjectAllocationService.ts
 * @description Service for subject allocation API operations
 */

import axiosInstance from "@/lib/axiosInstance";
import { SUBJECT_ALLOCATION_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  SubjectAllocation,
  CreateSubjectAllocationData,
  UpdateSubjectAllocationData,
} from "@/interfaces/subjectAllocation";
import { ApiResponse, IdType } from "@/interfaces/common";

const subjectAllocationService = {
  // Get all active subject allocations
  getAllSubjectAllocations: async (): Promise<SubjectAllocation[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ subjectAllocations: SubjectAllocation[] }>
    >(SUBJECT_ALLOCATION_ENDPOINTS.BASE);
    return response.data.data.subjectAllocations;
  },

  // Create a new subject allocation
  createSubjectAllocation: async (
    allocationData: CreateSubjectAllocationData,
  ): Promise<SubjectAllocation> => {
    const response = await axiosInstance.post<
      ApiResponse<{ subjectAllocation: SubjectAllocation }>
    >(SUBJECT_ALLOCATION_ENDPOINTS.BASE, allocationData);
    return response.data.data.subjectAllocation;
  },

  // Get a single subject allocation by ID
  getSubjectAllocationById: async (id: IdType): Promise<SubjectAllocation> => {
    const response = await axiosInstance.get<
      ApiResponse<{ subjectAllocation: SubjectAllocation }>
    >(SUBJECT_ALLOCATION_ENDPOINTS.getById(id));
    return response.data.data.subjectAllocation;
  },

  // Update an existing subject allocation
  updateSubjectAllocation: async (
    id: IdType,
    updateData: UpdateSubjectAllocationData,
  ): Promise<SubjectAllocation> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ subjectAllocation: SubjectAllocation }>
    >(SUBJECT_ALLOCATION_ENDPOINTS.getById(id), updateData);
    return response.data.data.subjectAllocation;
  },

  // Soft delete a subject allocation
  softDeleteSubjectAllocation: async (id: IdType): Promise<void> => {
    await axiosInstance.delete(SUBJECT_ALLOCATION_ENDPOINTS.getById(id));
  },
};

export default subjectAllocationService;

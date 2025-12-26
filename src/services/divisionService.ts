/**
 * @file src/services/divisionService.ts
 * @description Service for Division API operations
 */

import axiosInstance from "@/lib/axiosInstance";
import { DIVISION_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  Division,
  CreateDivisionData,
  UpdateDivisionData,
} from "@/interfaces/division";
import { ApiResponse, IdType } from "@/interfaces/common";

// Service for Division API operations
const divisionService = {
  // Fetch all divisions, optionally filtered by departmentId and semesterId
  getAllDivisions: async (
    departmentId?: IdType,
    semesterId?: IdType,
  ): Promise<Division[]> => {
    const params: { departmentId?: IdType; semesterId?: IdType } = {};
    if (departmentId) params.departmentId = departmentId;
    if (semesterId) params.semesterId = semesterId;
    const response = await axiosInstance.get<
      ApiResponse<{ divisions: Division[] }>
    >(DIVISION_ENDPOINTS.BASE, { params });
    return response.data.data.divisions;
  },

  // Create a new division
  createDivision: async (
    divisionData: CreateDivisionData,
  ): Promise<Division> => {
    const response = await axiosInstance.post<
      ApiResponse<{ division: Division }>
    >(DIVISION_ENDPOINTS.BASE, divisionData);
    return response.data.data.division;
  },

  // Fetch a single division by ID
  getDivisionById: async (id: IdType): Promise<Division> => {
    const response = await axiosInstance.get<
      ApiResponse<{ division: Division }>
    >(DIVISION_ENDPOINTS.getById(id));
    return response.data.data.division;
  },

  // Update an existing division
  updateDivision: async (
    id: IdType,
    updateData: UpdateDivisionData,
  ): Promise<Division> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ division: Division }>
    >(DIVISION_ENDPOINTS.getById(id), updateData);
    return response.data.data.division;
  },

  // Soft delete a division
  softDeleteDivision: async (id: IdType): Promise<void> => {
    await axiosInstance.delete(DIVISION_ENDPOINTS.getById(id));
  },

  // Batch create divisions
  batchCreateDivisions: async (
    divisions: CreateDivisionData[],
  ): Promise<Division[]> => {
    const response = await axiosInstance.post<
      ApiResponse<{ divisions: Division[] }>
    >(DIVISION_ENDPOINTS.BATCH, { divisions });
    return response.data.data.divisions;
  },
};

export default divisionService;

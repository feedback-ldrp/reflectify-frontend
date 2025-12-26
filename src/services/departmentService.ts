/**
 * @file src/services/departmentService.ts
 * @description Handles API requests related to departments.
 */

import axiosInstance from "@/lib/axiosInstance";
import { DEPARTMENT_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  Department,
  CreateDepartmentData,
  UpdateDepartmentData,
} from "@/interfaces/department";
import { ApiResponse, IdType } from "@/interfaces/common";

const departmentService = {
  // Fetch all departments
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ departments: Department[] }>
    >(DEPARTMENT_ENDPOINTS.BASE);
    return response.data.data.departments;
  },

  // Fetch a single department by ID
  getDepartmentById: async (id: IdType): Promise<Department> => {
    const response = await axiosInstance.get<
      ApiResponse<{ department: Department }>
    >(DEPARTMENT_ENDPOINTS.getById(id));
    return response.data.data.department;
  },

  // Create a new department
  createDepartment: async (
    departmentData: CreateDepartmentData,
  ): Promise<Department> => {
    const response = await axiosInstance.post<
      ApiResponse<{ department: Department }>
    >(DEPARTMENT_ENDPOINTS.BASE, departmentData);
    return response.data.data.department;
  },

  // Update an existing department
  updateDepartment: async (
    id: IdType,
    updateData: UpdateDepartmentData,
  ): Promise<Department> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ department: Department }>
    >(DEPARTMENT_ENDPOINTS.getById(id), updateData);
    return response.data.data.department;
  },

  // Soft delete a department
  softDeleteDepartment: async (id: IdType): Promise<void> => {
    await axiosInstance.delete(DEPARTMENT_ENDPOINTS.getById(id));
  },

  // Batch create departments
  batchCreateDepartments: async (
    departments: CreateDepartmentData[],
  ): Promise<Department[]> => {
    const response = await axiosInstance.post<
      ApiResponse<{ departments: Department[] }>
    >(DEPARTMENT_ENDPOINTS.BATCH, { departments });
    return response.data.data.departments;
  },
};

export default departmentService;

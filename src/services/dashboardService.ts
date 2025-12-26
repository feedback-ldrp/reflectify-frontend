/**
 * @file src/services/dashboardService.ts
 * @description Service for Dashboard API operations
 */

import axiosInstance from "@/lib/axiosInstance";
import { DASHBOARD_ENDPOINTS } from "@/constants/apiEndpoints";
import { DashboardStats } from "@/interfaces/dashboard";
import { ApiResponse } from "@/interfaces/common";

// Service for Dashboard API operations
const dashboardService = {
  // Fetch general statistics for the dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>(
      DASHBOARD_ENDPOINTS.STATS,
    );
    return response.data.data;
  },

  // Deletes all data from the database (development only)
  deleteAllData: async (): Promise<void> => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Database deletion is not allowed in production.");
    }
    await axiosInstance.delete(DASHBOARD_ENDPOINTS.DELETE_ALL_DATA);
  },
};

export default dashboardService;

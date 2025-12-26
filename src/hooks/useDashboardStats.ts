/**
 * @file src/hooks/useDashboardStats.ts
 * @description React Query hooks for dashboard statistics and destructive actions.
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import dashboardService from "@/services/dashboardService";
import { DashboardStats } from "@/interfaces/dashboard";

// Query keys for dashboard stats
export const DASHBOARD_STATS_QUERY_KEY = ["dashboardStats"];
export const DASHBOARD_DELETE_ALL_DATA_MUTATION_KEY = ["deleteAllData"];

// Fetch dashboard statistics
export const useDashboardStats = () =>
  useQuery<DashboardStats, Error>({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: dashboardService.getDashboardStats,
  });

// Delete all dashboard data (destructive)
export const useDeleteAllData = () =>
  useMutation({
    mutationKey: DASHBOARD_DELETE_ALL_DATA_MUTATION_KEY,
    mutationFn: dashboardService.deleteAllData,
  });

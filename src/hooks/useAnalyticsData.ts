/**
 * @file src/hooks/useAnalyticsData.ts
 * @description React Query hooks for analytics data and processing
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useCallback } from "react";
import analyticsService, {
    OptimizedAnalyticsResponse,
    SubjectDetailedAnalytics,
    FacultyDetailedAnalytics,
    DivisionDetailedAnalytics,
} from "@/services/analyticsService";
import { AnalyticsDataProcessor } from "@/utils/analyticsProcessor";
import {
    AnalyticsFilterParams,
    FilterDictionary,
    CompleteAnalyticsData,
    FeedbackSnapshot,
    SubjectFacultyDetailPerformance,
} from "@/interfaces/analytics";

// Query keys for analytics data
export const ANALYTICS_KEYS = {
    all: ["analytics"] as const,
    filterDictionary: () =>
        [...ANALYTICS_KEYS.all, "filterDictionary"] as const,
    completeData: (filters: AnalyticsFilterParams) =>
        [...ANALYTICS_KEYS.all, "completeData", filters] as const,
    optimizedData: (filters: AnalyticsFilterParams) =>
        [...ANALYTICS_KEYS.all, "optimizedData", filters] as const,
    totalResponses: () => [...ANALYTICS_KEYS.all, "totalResponses"] as const,
    subjectDetailed: (subjectId: string, filters?: any) =>
        [...ANALYTICS_KEYS.all, "subject", subjectId, "detailed", filters] as const,
    facultyDetailed: (facultyId: string, filters?: any) =>
        [...ANALYTICS_KEYS.all, "faculty", facultyId, "detailed", filters] as const,
    divisionDetailed: (divisionId: string, filters?: any) =>
        [...ANALYTICS_KEYS.all, "division", divisionId, "detailed", filters] as const,
};

// Fetch filter dictionary for dropdowns
export const useFilterDictionary = () => {
    return useQuery<FilterDictionary>({
        queryKey: ANALYTICS_KEYS.filterDictionary(),
        queryFn: analyticsService.getFilterDictionary,
        staleTime: 5 * 60 * 1000,
    });
};

// Fetch complete analytics data with filters
export const useCompleteAnalyticsData = (
    filters: AnalyticsFilterParams = {}
) => {
    return useQuery<CompleteAnalyticsData>({
        queryKey: ANALYTICS_KEYS.completeData(filters),
        queryFn: () => analyticsService.getCompleteAnalyticsData(filters),
        staleTime: 2 * 60 * 1000,
    });
};

// Fetch total responses count
export const useTotalResponses = () => {
    return useQuery({
        queryKey: ANALYTICS_KEYS.totalResponses(),
        queryFn: analyticsService.getTotalResponses,
        staleTime: 5 * 60 * 1000,
    });
};

export interface ProcessedAnalyticsData {
    overallStats: ReturnType<
        typeof AnalyticsDataProcessor.processOverallStats
    > | null;
    subjectRatings: ReturnType<
        typeof AnalyticsDataProcessor.processSubjectRatings
    >;
    divisionComparisons: ReturnType<
        typeof AnalyticsDataProcessor.processDivisionComparisons
    >;
    facultyPerformance: ReturnType<
        typeof AnalyticsDataProcessor.processFacultyPerformance
    >;
    lectureLabComparison: ReturnType<
        typeof AnalyticsDataProcessor.processLectureLabComparison
    > | null;
    filteringOptions: ReturnType<
        typeof AnalyticsDataProcessor.getFilteringOptions
    > | null;
    rawSnapshots: FeedbackSnapshot[];
    academicYearDepartmentTrends: ReturnType<
        typeof AnalyticsDataProcessor.processAcademicYearDepartmentTrends
    >;
    academicYearSemesterTrends: ReturnType<
        typeof AnalyticsDataProcessor.processAcademicYearSemesterTrends
    >;
    academicYearDivisionPerformance: ReturnType<
        typeof AnalyticsDataProcessor.processAcademicYearDivisionTrends
    >;
    batchComparisons: ReturnType<
        typeof AnalyticsDataProcessor.processDivisionComparisons
    >;
    subjectFacultyPerformance: ReturnType<
        typeof AnalyticsDataProcessor.processSubjectFacultyPerformance
    >;
    subjectFacultyDetailPerformance: SubjectFacultyDetailPerformance | null;
}

// Processed analytics data hook
export const useProcessedAnalytics = (filters: AnalyticsFilterParams = {}) => {
    const {
        data: rawData,
        isLoading,
        error,
        refetch,
    } = useCompleteAnalyticsData(filters); // Assuming this hook fetches the full BackendData

    // Memoize processed analytics data
    const processedData = useMemo<ProcessedAnalyticsData | null>(() => {
        if (!rawData || !rawData.feedbackSnapshots) {
            return {
                overallStats: null,
                subjectRatings: [],
                semesterTrends: [],
                divisionComparisons: [],
                facultyPerformance: [],
                lectureLabComparison: null,
                filteringOptions: null,
                rawSnapshots: [],
                academicYearDepartmentTrends: [],
                academicYearSemesterTrends: [],
                academicYearDivisionPerformance: [],
                batchComparisons: [], // Initialize the new property
                subjectFacultyPerformance: [],
                subjectFacultyDetailPerformance: null,
            };
        }

        const snapshots = rawData.feedbackSnapshots;

        // Determine if a single division is selected by its ID
        const isSingleDivisionIdSelected =
            filters.divisionId && typeof filters.divisionId === "string";

        // Filter snapshots for a specific division if one is selected for batch comparison
        const filteredSnapshotsForBatchComparison = isSingleDivisionIdSelected
            ? snapshots.filter((s) => s.divisionId === filters.divisionId)
            : [];

        // Determine if a single subject is selected by its ID
        const isSingleSubjectIdSelected =
            filters.subjectId && typeof filters.subjectId === "string";

        const processedResult: ProcessedAnalyticsData = {
            overallStats: AnalyticsDataProcessor.processOverallStats(snapshots),
            subjectRatings:
                AnalyticsDataProcessor.processSubjectRatings(snapshots),
            divisionComparisons:
                AnalyticsDataProcessor.processDivisionComparisons(snapshots),
            facultyPerformance:
                AnalyticsDataProcessor.processFacultyPerformance(snapshots),
            lectureLabComparison:
                AnalyticsDataProcessor.processLectureLabComparison(snapshots),
            filteringOptions:
                AnalyticsDataProcessor.getFilteringOptions(snapshots),
            rawSnapshots: snapshots,
            academicYearDepartmentTrends:
                AnalyticsDataProcessor.processAcademicYearDepartmentTrends(
                    snapshots
                ),
            academicYearSemesterTrends:
                AnalyticsDataProcessor.processAcademicYearSemesterTrends(
                    snapshots
                ),
            academicYearDivisionPerformance:
                AnalyticsDataProcessor.processAcademicYearDivisionTrends(
                    snapshots
                ),
            batchComparisons: AnalyticsDataProcessor.processDivisionComparisons(
                filteredSnapshotsForBatchComparison
            ),
            subjectFacultyPerformance:
                AnalyticsDataProcessor.processSubjectFacultyPerformance(
                    snapshots
                ),
            subjectFacultyDetailPerformance: isSingleSubjectIdSelected
                ? AnalyticsDataProcessor.processSubjectFacultyDetailPerformance(
                      snapshots,
                      filters.subjectId as string
                  )
                : null,
        };

        return processedResult;
    }, [rawData, filters.divisionId, filters.subjectId]);

    return { data: processedData, rawData, isLoading, error, refetch };
};

// Analytics cache invalidation actions
export const useAnalyticsActions = () => {
    const queryClient = useQueryClient();
    // Invalidate all analytics queries
    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ANALYTICS_KEYS.all });
    };
    // Invalidate only complete analytics data
    const invalidateCompleteData = () => {
        queryClient.invalidateQueries({
            queryKey: [...ANALYTICS_KEYS.all, "completeData"],
        });
    };
    // Invalidate only filter dictionary
    const invalidateFilterDictionary = () => {
        queryClient.invalidateQueries({
            queryKey: ANALYTICS_KEYS.filterDictionary(),
        });
    };
    return {
        invalidateAll,
        invalidateCompleteData,
        invalidateFilterDictionary,
    };
};

// ==================== OPTIMIZED ANALYTICS HOOKS ====================
// These hooks use the new backend endpoints that return pre-aggregated data

// Fetch optimized (pre-aggregated) analytics data - recommended for new implementations
export const useOptimizedAnalyticsData = (filters: AnalyticsFilterParams = {}) => {
    return useQuery<OptimizedAnalyticsResponse>({
        queryKey: ANALYTICS_KEYS.optimizedData(filters),
        queryFn: () => analyticsService.getOptimizedAnalyticsData(filters),
        staleTime: 0, // Real-time data as requested
    });
};

// Fetch subject detailed analytics for drill-down
export const useSubjectDetailedAnalytics = (
    subjectId: string | null,
    filters?: { academicYearId?: string; semesterId?: string; departmentId?: string }
) => {
    return useQuery<SubjectDetailedAnalytics>({
        queryKey: ANALYTICS_KEYS.subjectDetailed(subjectId || "", filters),
        queryFn: () => analyticsService.getSubjectDetailedAnalytics(subjectId!, filters),
        enabled: !!subjectId,
        staleTime: 0, // Real-time data
    });
};

// Fetch faculty detailed analytics for drill-down
export const useFacultyDetailedAnalytics = (
    facultyId: string | null,
    filters?: { academicYearId?: string }
) => {
    return useQuery<FacultyDetailedAnalytics>({
        queryKey: ANALYTICS_KEYS.facultyDetailed(facultyId || "", filters),
        queryFn: () => analyticsService.getFacultyDetailedAnalytics(facultyId!, filters),
        enabled: !!facultyId,
        staleTime: 0, // Real-time data
    });
};

// Fetch division detailed analytics for drill-down
export const useDivisionDetailedAnalytics = (
    divisionId: string | null,
    filters?: { academicYearId?: string }
) => {
    return useQuery<DivisionDetailedAnalytics>({
        queryKey: ANALYTICS_KEYS.divisionDetailed(divisionId || "", filters),
        queryFn: () => analyticsService.getDivisionDetailedAnalytics(divisionId!, filters),
        enabled: !!divisionId,
        staleTime: 0, // Real-time data
    });
};

// ==================== DRILL-DOWN STATE MANAGEMENT ====================

interface DrillDownState {
    activePanel: 'subject' | 'faculty' | 'division' | null;
    subjectId: string | null;
    subjectName: string | null;
    facultyId: string | null;
    facultyName: string | null;
    divisionId: string | null;
    divisionName: string | null;
}

const initialDrillDownState: DrillDownState = {
    activePanel: null,
    subjectId: null,
    subjectName: null,
    facultyId: null,
    facultyName: null,
    divisionId: null,
    divisionName: null,
};

// Hook to manage drill-down panel state
export const useAnalyticsDrillDown = (filters?: AnalyticsFilterParams) => {
    const [state, setState] = useState<DrillDownState>(initialDrillDownState);

    const openSubjectPanel = useCallback((subjectId: string, subjectName: string) => {
        setState({
            ...initialDrillDownState,
            activePanel: 'subject',
            subjectId,
            subjectName,
        });
    }, []);

    const openFacultyPanel = useCallback((facultyId: string, facultyName: string) => {
        setState({
            ...initialDrillDownState,
            activePanel: 'faculty',
            facultyId,
            facultyName,
        });
    }, []);

    const openDivisionPanel = useCallback((divisionId: string, divisionName: string) => {
        setState({
            ...initialDrillDownState,
            activePanel: 'division',
            divisionId,
            divisionName,
        });
    }, []);

    const closePanel = useCallback(() => {
        setState(initialDrillDownState);
    }, []);

    // Navigate from one panel to another (for nested drill-down)
    const navigateToSubject = useCallback((subjectId: string, subjectName: string) => {
        setState((prev) => ({
            ...prev,
            activePanel: 'subject',
            subjectId,
            subjectName,
        }));
    }, []);

    const navigateToFaculty = useCallback((facultyId: string, facultyName: string) => {
        setState((prev) => ({
            ...prev,
            activePanel: 'faculty',
            facultyId,
            facultyName,
        }));
    }, []);

    const navigateToDivision = useCallback((divisionId: string, divisionName: string) => {
        setState((prev) => ({
            ...prev,
            activePanel: 'division',
            divisionId,
            divisionName,
        }));
    }, []);

    return {
        state,
        isSubjectPanelOpen: state.activePanel === 'subject',
        isFacultyPanelOpen: state.activePanel === 'faculty',
        isDivisionPanelOpen: state.activePanel === 'division',
        openSubjectPanel,
        openFacultyPanel,
        openDivisionPanel,
        closePanel,
        navigateToSubject,
        navigateToFaculty,
        navigateToDivision,
        filters,
    };
};


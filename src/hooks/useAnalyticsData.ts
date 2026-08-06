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
        data: optimizedData,
        isLoading,
        error,
        refetch,
    } = useOptimizedAnalyticsData(filters);

    // Keep the trends page's established view model while consuming the
    // server-side aggregates. This prevents the page from downloading and
    // processing every feedback snapshot in the browser.
    const processedData = useMemo<ProcessedAnalyticsData | null>(() => {
        if (!optimizedData) return null;

        const subjectRatings = optimizedData.subjectRatings.map((subject) => ({
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            subjectAbbreviation: subject.subjectAbbreviation || "",
            lectureAverageRating: subject.lectureRating,
            labAverageRating: subject.labRating,
            overallAverageRating: subject.overallRating,
            totalLectureResponses: subject.lectureResponses,
            totalLabResponses: subject.labResponses,
            totalOverallResponses: subject.totalResponses,
        }));

        const facultyPerformance = optimizedData.facultyPerformance.map(
            (faculty) => ({
                facultyId: faculty.facultyId,
                facultyName: faculty.facultyName,
                academicYearId: filters.academicYearId || "all",
                averageRating: faculty.averageRating,
                totalResponses: faculty.totalResponses,
            })
        );

        const divisionComparisons = optimizedData.divisionPerformance.map(
            (division) => ({
                departmentId: division.departmentId,
                departmentName: division.departmentName,
                divisionId: division.divisionId,
                divisionName: division.divisionName,
                batch: "all",
                averageRating: division.averageRating,
                totalResponses: division.totalResponses,
                engagementScore: Math.min(
                    10,
                    Math.round(division.totalResponses / 5)
                ),
            })
        );

        const academicYearSemesterTrends = optimizedData.semesterTrends.map(
            (trend) => ({
                semesterNumber: trend.semesterNumber,
                academicYearData: trend.academicYearData.map((year) => ({
                    academicYearString: year.academicYearString,
                    averageRating: year.averageRating,
                    responseCount: year.responseCount,
                })),
            })
        );

        const academicYearDepartmentTrends = optimizedData.departmentTrends.map(
            (trend) => ({
                academicYearString: trend.academicYearString,
                departmentData: trend.departmentData.map((department) => ({
                    departmentName: department.departmentName,
                    averageRating: department.averageRating,
                    responseCount: department.responseCount,
                })),
            })
        );

        const academicYearDivisionPerformance =
            optimizedData.academicYearDivisionTrends.map((trend) => ({
                academicYearString: trend.academicYearString,
                divisionData: trend.divisionData.map((division) => ({
                    divisionName: division.divisionName,
                    averageRating: division.averageRating,
                    responseCount: division.responseCount,
                })),
            }));

        const lectureResponses = subjectRatings.reduce(
            (total, subject) => total + subject.totalLectureResponses,
            0
        );
        const labResponses = subjectRatings.reduce(
            (total, subject) => total + subject.totalLabResponses,
            0
        );
        const lectureRatingTotal = subjectRatings.reduce(
            (total, subject) =>
                total +
                (subject.lectureAverageRating || 0) *
                    subject.totalLectureResponses,
            0
        );
        const labRatingTotal = subjectRatings.reduce(
            (total, subject) =>
                total +
                (subject.labAverageRating || 0) * subject.totalLabResponses,
            0
        );

        const lectureLabComparison = {
            lectureAverageRating:
                lectureResponses > 0
                    ? Number((lectureRatingTotal / lectureResponses).toFixed(2))
                    : 0,
            labAverageRating:
                labResponses > 0
                    ? Number((labRatingTotal / labResponses).toFixed(2))
                    : 0,
            totalLectureResponses: lectureResponses,
            totalLabResponses: labResponses,
        };

        return {
            overallStats: {
                ...optimizedData.overallStats,
                responseRate:
                    optimizedData.overallStats.totalResponses > 0 ? 100 : 0,
            },
            subjectRatings,
            divisionComparisons,
            facultyPerformance,
            lectureLabComparison,
            filteringOptions: null,
            rawSnapshots: [],
            academicYearDepartmentTrends,
            academicYearSemesterTrends,
            academicYearDivisionPerformance,
            batchComparisons: optimizedData.batchComparisons,
            subjectFacultyPerformance:
                optimizedData.subjectFacultyPerformance,
            subjectFacultyDetailPerformance: null,
        };
    }, [optimizedData, filters.academicYearId]);

    return {
        data: processedData,
        rawData: optimizedData,
        isLoading,
        error,
        refetch,
    };
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
export function useOptimizedAnalyticsData(
    filters: AnalyticsFilterParams = {}
) {
    return useQuery<OptimizedAnalyticsResponse>({
        queryKey: ANALYTICS_KEYS.optimizedData(filters),
        queryFn: () => analyticsService.getOptimizedAnalyticsData(filters),
        staleTime: 0, // Real-time data as requested
    });
}

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

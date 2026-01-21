/**
 * @file src/services/analyticsService.ts
 * @description Service for analytics API operations
 */

// src/services/analyticsService.ts

import axiosInstance from "@/lib/axiosInstance";
import { ANALYTICS_ENDPOINTS } from "@/constants/apiEndpoints";

// Import analytics interfaces
import {
    OverallSemesterRating,
    SemesterWithResponseCount,
    SubjectLectureLabRating,
    DivisionBatchComparison,
    LabLectureComparison,
    FacultyYearPerformance,
    FacultyOverallPerformanceSummary,
    TotalResponsesCount,
    SemesterDivisionWithResponseCounts,
    FilterDictionary,
    CompleteAnalyticsData,
    AnalyticsFilterParams,
} from "@/interfaces/analytics";
import { ApiResponse, IdType } from "@/interfaces/common";
import showToast from "@/lib/toast";

const analyticsService = {
    // Retrieves overall average rating for a specific semester, with optional filters.
    getOverallSemesterRating: async (
        semesterId: IdType,
        divisionId?: IdType,
        batch?: string
    ): Promise<OverallSemesterRating> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<OverallSemesterRating>
            >(ANALYTICS_ENDPOINTS.OVERALL_SEMESTER_RATING(semesterId), {
                params: { divisionId, batch },
            });
            return response.data.data;
        } catch (error) {
            showToast.error(
                `Failed to fetch overall semester rating for semester ${semesterId}: ` + error
            );
            throw error;
        }
    },

    // Retrieves a list of semesters that have associated feedback responses, with optional filtering.
    getSemestersWithResponses: async (
        academicYearId?: IdType,
        departmentId?: IdType
    ): Promise<SemesterWithResponseCount[]> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<{ semesters: SemesterWithResponseCount[] }>
            >(ANALYTICS_ENDPOINTS.SEMESTERS_WITH_RESPONSES, {
                params: { academicYearId, departmentId },
            });
            return response.data.data.semesters || [];
        } catch (error) {
            showToast.error("Failed to fetch semesters with responses: " + error);
            return [];
        }
    },

    // Calculates subject-wise ratings for a given semester, broken down by lecture type.
    getSubjectWiseLectureLabRating: async (
        semesterId: IdType
    ): Promise<SubjectLectureLabRating[]> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<{ ratings: SubjectLectureLabRating[] }>
            >(ANALYTICS_ENDPOINTS.SUBJECT_WISE_LECTURE_LAB_RATING(semesterId));
            return response.data.data.ratings;
        } catch (error) {
            showToast.error(
                `Failed to fetch subject-wise lecture/lab ratings for semester ${semesterId}: ` + error
            );
            throw error;
        }
    },

    // Compares average ratings across different divisions and batches for a given semester.
    getDivisionBatchComparisons: async (
        semesterId: IdType
    ): Promise<DivisionBatchComparison[]> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<{ comparisons: DivisionBatchComparison[] }>
            >(ANALYTICS_ENDPOINTS.DIVISION_BATCH_COMPARISONS(semesterId));
            return response.data.data.comparisons;
        } catch (error) {
            showToast.error(
                `Failed to fetch division/batch comparisons for semester ${semesterId}: ` + error
            );
            throw error;
        }
    },

    // Compares average ratings between different lecture types (e.g., LECTURE, LAB) for a given semester.
    getLabLectureComparison: async (
        semesterId: IdType
    ): Promise<LabLectureComparison[]> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<{ comparisons: LabLectureComparison[] }>
            >(ANALYTICS_ENDPOINTS.LAB_LECTURE_COMPARISON(semesterId));
            return response.data.data.comparisons;
        } catch (error) {
            showToast.error(
                `Failed to fetch lab/lecture comparison for semester ${semesterId}: ` + error
            );
            throw error;
        }
    },

    // Retrieves performance data for a single faculty member across semesters for a given academic year.
    getFacultyPerformanceYearData: async (
        facultyId: IdType,
        academicYearId: IdType
    ): Promise<FacultyYearPerformance> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<FacultyYearPerformance>
            >(
                ANALYTICS_ENDPOINTS.GET_FACULTY_PERFORMANCE_YEAR_DATA(
                    facultyId,
                    academicYearId
                )
            );
            return response.data.data;
        } catch (error) {
            showToast.error(
                `Failed to fetch faculty performance data for faculty ${facultyId} in academic year ${academicYearId}: ` + error
            );
            throw error;
        }
    },

    // Retrieves performance data for all faculty members for a given academic year.
    getAllFacultyPerformanceData: async (
        academicYearId: IdType
    ): Promise<FacultyOverallPerformanceSummary[]> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<{ data: FacultyOverallPerformanceSummary[] }>
            >(
                ANALYTICS_ENDPOINTS.GET_ALL_FACULTY_PERFORMANCE_DATA(
                    academicYearId
                )
            ); // Note the extra 'data' nesting here from the controller.
            return response.data.data.data || []; // Return empty array if undefined
        } catch (error) {
            showToast.error(
                `Failed to fetch all faculty performance data for academic year ${academicYearId}: ` + error
            );
            return []; // Return empty array on error instead of throwing
        }
    },

    // Retrieves the total number of student responses.
    getTotalResponses: async (): Promise<TotalResponsesCount> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<TotalResponsesCount>
            >(ANALYTICS_ENDPOINTS.TOTAL_RESPONSES);
            return response.data.data;
        } catch (error) {
            showToast.error("Failed to fetch total responses: " + error);
            throw error;
        }
    },

    // Retrieves semesters and their divisions, including response counts for each division.
    getSemesterDivisionsWithResponseCounts: async (): Promise<
        SemesterDivisionWithResponseCounts[]
    > => {
        try {
            // Note: The controller returns `success: true, data: data`, not `status: 'success', data: { data: data }`.
            // So, ApiResponse needs to be flexible or we adjust the access.
            const response = await axiosInstance.get<{
                success: boolean;
                data: SemesterDivisionWithResponseCounts[];
            }>(ANALYTICS_ENDPOINTS.SEMESTER_DIVISIONS_WITH_RESPONSES); // Adjusting for specific controller response
            return response.data.data;
        } catch (error) {
            showToast.error(
                "Failed to fetch semester divisions with response counts: " + error
            );
            throw error;
        }
    },

    // Get filter dictionary with hierarchical structure
    getFilterDictionary: async (): Promise<FilterDictionary> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<FilterDictionary>
            >("/api/v1/analytics/filter-dictionary");
            return response.data.data;
        } catch (error) {
            showToast.error("Failed to fetch filter dictionary: " + error);
            throw error;
        }
    },

    // Get complete analytics data with optional filters
    getCompleteAnalyticsData: async (
        filters?: AnalyticsFilterParams
    ): Promise<CompleteAnalyticsData> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<CompleteAnalyticsData>
            >("/api/v1/analytics/complete-data", {
                params: filters,
            });
            return response.data.data;
        } catch (error) {
            showToast.error("Error fetching complete analytics data: " + error);
            throw error;
        }
    },

    // ==================== OPTIMIZED ANALYTICS DATA ====================

    // Get optimized (pre-aggregated) analytics data - no raw snapshots returned
    getOptimizedAnalyticsData: async (
        filters?: AnalyticsFilterParams
    ): Promise<OptimizedAnalyticsResponse> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<OptimizedAnalyticsResponse>
            >("/api/v1/analytics/optimized-data", {
                params: filters,
            });
            return response.data.data;
        } catch (error) {
            showToast.error("Error fetching optimized analytics data: " + error);
            throw error;
        }
    },

    // ==================== DETAILED DRILL-DOWN ENDPOINTS ====================

    // Get detailed analytics for a specific subject
    getSubjectDetailedAnalytics: async (
        subjectId: IdType,
        filters?: { academicYearId?: IdType; semesterId?: IdType; departmentId?: IdType }
    ): Promise<SubjectDetailedAnalytics> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<SubjectDetailedAnalytics>
            >(`/api/v1/analytics/subjects/${subjectId}/detailed`, {
                params: filters,
            });
            return response.data.data;
        } catch (error) {
            showToast.error("Error fetching subject detailed analytics: " + error);
            throw error;
        }
    },

    // Get detailed analytics for a specific faculty member
    getFacultyDetailedAnalytics: async (
        facultyId: IdType,
        filters?: { academicYearId?: IdType }
    ): Promise<FacultyDetailedAnalytics> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<FacultyDetailedAnalytics>
            >(`/api/v1/analytics/faculty/${facultyId}/detailed`, {
                params: filters,
            });
            return response.data.data;
        } catch (error) {
            showToast.error("Error fetching faculty detailed analytics: " + error);
            throw error;
        }
    },

    // Get detailed analytics for a specific division
    getDivisionDetailedAnalytics: async (
        divisionId: IdType,
        filters?: { academicYearId?: IdType }
    ): Promise<DivisionDetailedAnalytics> => {
        try {
            const response = await axiosInstance.get<
                ApiResponse<DivisionDetailedAnalytics>
            >(`/api/v1/analytics/divisions/${divisionId}/detailed`, {
                params: filters,
            });
            return response.data.data;
        } catch (error) {
            showToast.error("Error fetching division detailed analytics: " + error);
            throw error;
        }
    },
};

// ==================== DETAILED ANALYTICS INTERFACES ====================

export interface OptimizedAnalyticsResponse {
    overallStats: {
        totalResponses: number;
        averageRating: number;
        uniqueSubjects: number;
        uniqueFaculties: number;
        uniqueStudents: number;
        uniqueDivisions: number;
    };
    subjectRatings: Array<{
        subjectId: string;
        subjectName: string;
        subjectAbbreviation: string;
        subjectCode: string;
        lectureRating: number | null;
        labRating: number | null;
        overallRating: number;
        lectureResponses: number;
        labResponses: number;
        totalResponses: number;
        facultyCount: number;
        divisionCount: number;
    }>;
    facultyPerformance: Array<{
        facultyId: string;
        facultyName: string;
        facultyAbbreviation: string;
        designation: string;
        averageRating: number;
        totalResponses: number;
        rank: number;
        subjectCount: number;
        divisionCount: number;
    }>;
    divisionPerformance: Array<{
        divisionId: string;
        divisionName: string;
        departmentName: string;
        semesterNumber: number;
        averageRating: number;
        totalResponses: number;
        facultyCount: number;
        subjectCount: number;
    }>;
    academicYearTrends: Array<{
        academicYearId: string;
        academicYearString: string;
        averageRating: number;
        totalResponses: number;
        departmentCount: number;
        divisionCount: number;
    }>;
    semesterTrends: Array<{
        semesterNumber: number;
        academicYearData: Array<{
            academicYearId: string;
            academicYearString: string;
            averageRating: number;
            responseCount: number;
        }>;
    }>;
    departmentTrends: Array<{
        academicYearString: string;
        departmentData: Array<{
            departmentId: string;
            departmentName: string;
            averageRating: number;
            responseCount: number;
        }>;
    }>;
    filters: {
        academicYearId?: string;
        departmentId?: string;
        semesterId?: string;
        divisionId?: string;
        subjectId?: string;
        lectureType?: string;
    };
    generatedAt: string;
}

export interface SubjectDetailedAnalytics {
    subject: {
        id: string;
        name: string;
        abbreviation: string;
        code: string;
    };
    overallRating: number;
    lectureRating: number | null;
    labRating: number | null;
    totalResponses: number;
    lectureResponses: number;
    labResponses: number;
    facultyBreakdown: Array<{
        facultyId: string;
        facultyName: string;
        facultyAbbreviation: string;
        lectureType: 'LECTURE' | 'LAB';
        rating: number;
        responses: number;
        divisions: string[];
    }>;
    divisionBreakdown: Array<{
        divisionId: string;
        divisionName: string;
        lectureRating: number | null;
        labRating: number | null;
        totalRating: number;
        responses: number;
    }>;
    questionBreakdown: Array<{
        categoryId: string;
        categoryName: string;
        avgRating: number;
        questionCount: number;
    }>;
}

export interface FacultyDetailedAnalytics {
    faculty: {
        id: string;
        name: string;
        abbreviation: string;
        designation: string;
    };
    overallRating: number;
    totalResponses: number;
    rank: number;
    totalFaculty: number;
    subjectBreakdown: Array<{
        subjectId: string;
        subjectName: string;
        subjectAbbreviation: string;
        lectureType: 'LECTURE' | 'LAB';
        rating: number;
        responses: number;
        semester: number;
        academicYear: string;
    }>;
    divisionBreakdown: Array<{
        divisionId: string;
        divisionName: string;
        subjectName: string;
        lectureType: 'LECTURE' | 'LAB';
        rating: number;
        responses: number;
    }>;
    questionCategoryBreakdown: Array<{
        category: string;
        avgRating: number;
        questionCount: number;
    }>;
    trendData: Array<{
        academicYearId: string;
        academicYear: string;
        semester: number;
        rating: number;
        responses: number;
    }>;
}

export interface DivisionDetailedAnalytics {
    division: {
        id: string;
        name: string;
        departmentName: string;
        semesterNumber: number;
    };
    overallRating: number;
    totalResponses: number;
    facultyBreakdown: Array<{
        facultyId: string;
        facultyName: string;
        facultyAbbreviation: string;
        subjectName: string;
        lectureType: 'LECTURE' | 'LAB';
        rating: number;
        responses: number;
    }>;
    subjectBreakdown: Array<{
        subjectId: string;
        subjectName: string;
        subjectAbbreviation: string;
        lectureRating: number | null;
        labRating: number | null;
        totalRating: number;
        responses: number;
    }>;
    academicYearComparison: Array<{
        academicYearId: string;
        academicYearString: string;
        rating: number;
        responses: number;
    }>;
}

export default analyticsService;

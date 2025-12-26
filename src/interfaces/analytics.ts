/**
 * @file src/interfaces/analytics.ts
 * @description Interfaces for analytics-related data structures and API responses
 */

import { IdType } from "./common";

// Represents a single processed feedback record (from raw Prisma data).
export interface FeedbackSnapshot {
  id: IdType;
  academicYearId: IdType;
  academicYearString: string;
  departmentId: IdType;
  departmentName: string;
  departmentAbbreviation: string;
  semesterId: IdType;
  semesterNumber: number;
  divisionId: IdType;
  divisionName: string;
  subjectId: IdType;
  subjectName: string;
  subjectAbbreviation: string | null;
  subjectCode: string | null;
  facultyId: IdType;
  facultyName: string;
  facultyAbbreviation: string | null;
  studentId: IdType | null;
  studentEnrollmentNumber: string;
  formId: IdType;
  formStatus: string;
  questionId: IdType;
  questionType: string;
  questionCategoryId: IdType;
  questionCategoryName: string;
  questionBatch: string | null;
  responseValue: string;
  batch: string | null;
  submittedAt: string;
  createdAt: string;
}

// type IdType = string;

// Dictionary for analytics filter dropdowns.
export interface FilterDictionary {
  academicYears: Array<{
    id: IdType;
    yearString: string;
    departments: Array<{
      id: IdType;
      name: string;
      abbreviation: string;
      subjects: Array<{
        id: IdType;
        name: string;
        code: string;
        type: string;
      }>;
      semesters: Array<{
        id: IdType;
        semesterNumber: number;
        divisions: Array<{
          id: IdType;
          divisionName: string;
        }>;
      }>;
    }>;
  }>;
  lectureTypes: Array<{
    value: LectureLabType;
    label: string;
  }>;
}

// Complete analytics data returned by getCompleteAnalyticsData.
export interface CompleteAnalyticsData {
  semesters: Array<{
    id: IdType;
    semesterNumber: number;
    departmentId: IdType;
    academicYearId: IdType;
    startDate: string | null;
    endDate: string | null;
    semesterType: string;
    department: {
      id: IdType;
      name: string;
      abbreviation: string;
    };
    academicYear: {
      id: IdType;
      yearString: string;
    };
    responseCount: number;
  }>;
  subjectRatings: Array<{
    subjectId: IdType;
    subjectName: string;
    subjectAbbreviation: string;
    lectureType: LectureLabType;
    averageRating: number;
    responseCount: number;
    semesterNumber: number;
    academicYearId: IdType;
    facultyId: IdType;
    facultyName: string;
  }>;
  semesterTrends: Array<{
    subject: string;
    semester: number;
    averageRating: number;
    responseCount: number;
    academicYearId: IdType;
    academicYear: string;
  }>;
  feedbackSnapshots: FeedbackSnapshot[];
}

// Parameters for analytics filtering (for backend queries).
export interface AnalyticsFilterParams {
  academicYearId?: IdType;
  departmentId?: IdType;
  semesterId?: IdType;
  semesterNumber?: number;
  subject?: string; // This will be subjectName
  subjectId?: string; // Added for detailed subject-faculty filtering
  divisionId?: IdType;
  divisionName?: string;
  lectureType?: LectureLabType;
  includeDeleted?: boolean;
}

export interface SubjectFacultyDetailPerformance {
  subjectName: string;
  subjectAbbreviation: string;
  overallSubjectAverage: number | null;
  overallSubjectResponses: number; // Added for completeness
  facultyData: {
    facultyId: string;
    facultyName: string;
    averageRating: number;
    responseCount: number;
  }[];
}

// Overall semester rating summary.
export interface OverallSemesterRating {
  averageRating: number;
  totalResponses: number;
  semesterId: IdType;
  semesterName: string;
  academicYearName: string;
  departmentName: string;
}

// Semester with response count (for analytics charts).
export interface SemesterWithResponseCount {
  id: IdType;
  semesterNumber: number;
  departmentId: IdType;
  responseCount: number;
  academicYear: { id: IdType; yearString: string };
  department: { id: IdType; name: string; abbreviation: string };
}

// Type for lecture/lab distinction.
export type LectureLabType = "LECTURE" | "LAB";

// Subject-wise lecture/lab rating summary.
export interface SubjectLectureLabRating {
  subjectId: IdType;
  subjectName: string;
  subjectAbbreviation: string;
  facultyId?: IdType;
  facultyName?: string;
  lectureAverageRating: number | null;
  labAverageRating: number | null;
  overallAverageRating: number | null;
  totalLectureResponses: number;
  totalLabResponses: number;
  totalOverallResponses: number;
}

export interface AcademicYearDepartmentTrend {
  academicYearString: string;
  departmentData: {
    departmentName: string;
    averageRating: number;
    responseCount: number;
  }[];
}

export interface AcademicYearSemesterTrend {
  semesterNumber: number;
  academicYearData: {
    academicYearString: string;
    averageRating: number;
    responseCount: number;
  }[];
}

export interface AcademicYearDivisionTrend {
  academicYearString: string;
  divisionData: {
    divisionName: string;
    averageRating: number;
    responseCount: number;
  }[];
}

/**
 * Division/batch comparison for department analytics.
 */
export interface DivisionBatchComparison {
  departmentId: IdType;
  departmentName: string;
  divisionId: IdType;
  divisionName: string;
  batch: string;
  averageRating: number;
  totalResponses: number;
  engagementScore?: number;
}

/**
 * Lab/lecture comparison for department analytics.
 */
export interface LabLectureComparison {
  academicYearId: IdType;
  academicYear: string;
  departmentId: IdType;
  department: string;
  lectureOverallRating: number;
  labOverallRating: number;
  totalLectureResponses: number;
  totalLabResponses: number;
}

export interface SubjectFacultyPerformance {
  subjectName: string;
  subjectAbbreviation: string;
  overallSubjectAverage: number | null;
  overallSubjectResponses: number;
  facultyData: {
    facultyId: string;
    facultyName: string;
    averageRating: number;
    responseCount: number;
  }[];
}

/**
 * Faculty year performance summary.
 */
export interface FacultyYearPerformance {
  facultyId: IdType;
  facultyName: string;
  subjectId: IdType;
  subjectName: string;
  lectureAverageRating: number | null;
  labAverageRating: number | null;
  overallAverageRating: number | null;
  totalLectureResponses: number;
  totalLabResponses: number;
  totalOverallResponses: number;
  semesterNumber: number;
  academicYearId: IdType;
  academicYear: string;
}

/**
 * Faculty overall performance summary (for top/lowest faculties).
 */
export interface FacultyOverallPerformanceSummary {
  facultyId: IdType;
  facultyName: string;
  academicYearId: IdType;
  averageRating: number;
  totalResponses: number;
}

/**
 * Total responses count (for analytics widgets).
 */
export interface TotalResponsesCount {
  count: number;
}

// Semester divisions with response counts (for analytics charts).
export interface SemesterDivisionWithResponseCounts {
  semesterId: IdType;
  semesterNumber: number;
  departmentId: IdType;
  departmentName: string;
  divisionId: IdType;
  divisionName: string;
  responseCount: number;
}

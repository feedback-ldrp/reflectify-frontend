/**
 * @file src/interfaces/overrideStudent.ts
 * @description Interfaces for override student entity and related API data
 */

import { IdType } from "./common";

/**
 * Represents an override student (manually added for feedback form access).
 */
export interface OverrideStudent {
  id: IdType;
  feedbackFormOverrideId: string;
  name: string;
  email: string;
  enrollmentNumber?: string | null;
  batch?: string | null;
  phoneNumber?: string | null;
  department?: string | null;
  semester?: string | null;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Response when uploading override students via Excel/CSV.
 */
export interface OverrideStudentUploadResult {
  message: string;
  rowsAffected: number;
  skippedRows: number;
  skippedDetails: string[];
}

/**
 * Response when fetching paginated override students.
 */
export interface PaginatedOverrideStudents {
  students: OverrideStudent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Input for updating an override student.
 */
export interface UpdateOverrideStudentInput {
  name?: string;
  email?: string;
  enrollmentNumber?: string | null;
  batch?: string | null;
  phoneNumber?: string | null;
  department?: string | null;
  semester?: string | null;
}

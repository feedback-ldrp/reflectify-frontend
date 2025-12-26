/**
 * @file src/interfaces/academicYear.ts
 * @description Interfaces for Academic Year data structures and API responses
 */

import { IdType } from "./common";

/**
 * Represents a single academic year entity.
 */
export interface AcademicYear {
    id: IdType;
    yearString: string; // e.g., "2023-2024"
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    _count?: {
        semesters: number;
        subjectAllocations: number;
    };
}

/**
 * Data required to create a new AcademicYear.
 */
export interface CreateAcademicYearData {
    yearString: string;
    isActive?: boolean;
}

/**
 * Data for updating an existing AcademicYear (all fields optional).
 */
export interface UpdateAcademicYearData {
    yearString?: string;
    isActive?: boolean;
}

/**
 * API response for a single academic year.
 */
export interface AcademicYearApiResponse {
    status: "success";
    message?: string;
    data: {
        academicYear: AcademicYear;
    };
}

/**
 * API response for multiple academic years.
 */
export interface AcademicYearsApiResponse {
    status: "success";
    results: number;
    data: {
        academicYears: AcademicYear[];
    };
}

/**
 * Statistics for dashboard widgets related to academic years.
 */
export interface AcademicYearStats {
    totalAcademicYears: number;
    totalSemesters: number;
    totalSubjectAllocations: number;
    currentYear: AcademicYear | null;
}

/**
 * @file src/interfaces/semester.ts
 * @description Interfaces for Semester entity and related API data
 */

import { IdType } from "./common";
import { Department } from "./department";
import { AcademicYear } from "./academicYear";
import { Division } from "./division";
import { Subject } from "./subject";
import { SubjectAllocation } from "./subjectAllocation";
import { SemesterTypeEnum } from "@/constants/semesterTypes";

/**
 * Represents a semester entity.
 */
export interface Semester {
    id: IdType;
    semesterNumber: number;
    academicYearId: IdType;
    departmentId: IdType;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    academicYear?: AcademicYear;
    department?: Department;
    divisions?: Division[];
    subjects?: Subject[];
    allocations?: SubjectAllocation[];
}

/**
 * Data required to create a new semester.
 */
export interface CreateSemesterData {
    semesterNumber: number;
    academicYearId: IdType;
    departmentId: IdType;
    semesterType: SemesterTypeEnum;
}

/**
 * Data for updating an existing semester (all fields optional).
 */
export interface UpdateSemesterData {
    name?: string;
    semesterNumber?: number;
    academicYearId?: IdType;
    departmentId?: IdType;
    isActive?: boolean;
}

/**
 * Data structure for filtering semesters (e.g., for getAllSemesters).
 */
export interface GetSemestersFilters {
    departmentId?: IdType;
    academicYearId?: IdType;
}

/**
 * Data structure for batch creation of semesters.
 */
export interface BatchCreateSemesterInput {
    semesters: CreateSemesterData[];
}

/**
 * @file src/interfaces/division.ts
 * @description Interfaces for Division entity and related API data
 */

import { IdType } from "./common";
import { Department } from "./department";
import { FeedbackForm } from "./feedbackForm";
import { Semester } from "./semester";
import { SubjectAllocation } from "./subjectAllocation";

/**
 * Represents a division entity.
 */
export interface Division {
    id: IdType;
    divisionName: string;
    departmentId: IdType;
    semesterId: IdType;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    studentCount?: number;
    department?: Department;
    semester?: Semester;
    subjectAllocations?: SubjectAllocation[];
    feedbackForms?: FeedbackForm[];
}

/**
 * Data required to create a new division.
 */
export interface CreateDivisionData {
    divisionName: string;
    departmentId: IdType;
    semesterId: IdType;
}

/**
 * Data for updating an existing division (all fields optional).
 */
export interface UpdateDivisionData {
    divisionName?: string;
    departmentId?: IdType;
    semesterId?: IdType;
    isActive?: boolean;
}

/**
 * Data structure for batch creation of divisions.
 */
export interface BatchCreateDivisionInput {
    divisions: CreateDivisionData[];
}

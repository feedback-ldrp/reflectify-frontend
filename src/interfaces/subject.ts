/**
 * @file src/interfaces/subject.ts
 * @description Interfaces for Subject entity and related API data
 */

import { IdType } from "./common";
import { Department } from "./department";
import { Semester } from "./semester";
import { SubjectAllocation } from "./subjectAllocation";

/**
 * Represents a subject entity.
 */
export interface Subject {
    id: IdType;
    name: string;
    subjectCode: string;
    abbreviation?: string;
    description?: string;
    credits: number;
    semesterId: IdType;
    departmentId: IdType;
    createdAt: string;
    updatedAt: string;
    type: string;
    allocations?: SubjectAllocation[];
    department: Department;
    semester: Semester;
}

/**
 * Data required to create a new subject.
 */
export interface CreateSubjectData {
    name: string;
    abbreviation: string;
    subjectCode: string;
    semesterId: IdType;
    departmentId: IdType;
    type: string; // "MANDATORY" or "ELECTIVE"
}

/**
 * Data for updating an existing subject (all fields optional).
 */
export interface UpdateSubjectData {
    name?: string;
    abbreviation?: string;
    subjectCode?: string;
    semesterId?: IdType;
    departmentId?: IdType;
    type: string; // "MANDATORY" or "ELECTIVE"
}

/**
 * Data structure for batch creation of subjects.
 */
export interface BatchCreateSubjectInput {
    subjects: CreateSubjectData[];
}

/**
 * Data structure for subject abbreviations endpoint.
 */
export interface SubjectAbbreviation {
    id: IdType;
    code: string;
    name: string;
}

/**
 * @file src/interfaces/department.ts
 * @description Interfaces for Department entity and related API data
 */

import { IdType } from "./common";
import { Faculty } from "./faculty";
import { Semester } from "./semester";
import { Subject } from "./subject";

/**
 * Represents a department entity.
 */
export interface Department {
    id: IdType;
    name: string;
    abbreviation: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    hodName: string;
    hodEmail: string;
    college?: string;
    semesters?: Semester[];
    faculties?: Faculty[];
    subjects?: Subject[];
}

/**
 * Data required to create a new department.
 */
export interface CreateDepartmentData {
    name: string;
    abbreviation: string;
}

/**
 * Data for updating an existing department (all fields optional).
 */
export interface UpdateDepartmentData {
    name?: string;
    abbreviation?: string;
}

/**
 * Data structure for batch creation of departments.
 */
export interface BatchCreateDepartmentInput {
    departments: CreateDepartmentData[];
}

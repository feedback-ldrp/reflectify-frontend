/**
 * @file src/interfaces/faculty.ts
 * @description Interfaces for Faculty entity and related API data
 */

import { IdType } from "./common";
import { Designation } from "@/constants/designations";
import { Department } from "./department";

/**
 * Represents a faculty entity.
 */
export interface Faculty {
    id: IdType;
    name: string;
    email: string;
    abbreviation: string;
    designation: Designation;
    department: Department;
    departmentId: IdType;
    departmentAbbreviation: string;
    seatingLocation: string;
    joiningDate: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

/**
 * Data required to create a new faculty.
 */
export interface CreateFacultyData {
    name: string;
    email: string;
    abbreviation: string;
    designation: Designation;
    departmentId: IdType;
    seatingLocation?: string;
    joiningDate?: string;
}

/**
 * Data for updating an existing faculty (all fields optional).
 */
export interface UpdateFacultyData {
    name?: string;
    email?: string;
    abbreviation?: string;
    designation: Designation;
    departmentId?: IdType;
    seatingLocation?: string;
    joiningDate?: string;
}

/**
 * Data structure for batch creation of faculties.
 */
export interface BatchCreateFacultyInput {
    faculties: CreateFacultyData[];
}

/**
 * Data structure for faculty abbreviations endpoint.
 */
export interface FacultyAbbreviation {
    id: IdType;
    facultyAbbreviation: string;
    fullName: string;
}

/**
 * Form data structure for faculty creation/edit forms.
 */
export interface FacultyFormData {
    firstName: string;
    lastName: string;
    email: string;
    facultyAbbreviation: string;
    designation: Designation;
    departmentId: IdType | "";
    seatingLocation: string;
    joiningDate: string;
}

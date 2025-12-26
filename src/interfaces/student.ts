/**
 * @file src/interfaces/student.ts
 * @description Interfaces for Student entity and related API data
 */

import { IdType } from "./common";

/**
 * Represents a student entity.
 */
export interface Student {
  id: IdType;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentNumber: string;
  departmentId: IdType;
  departmentAbbreviation: string;
  semesterId: IdType;
  divisionId: IdType;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Data required to create a new student.
 */
export interface CreateStudentData {
  firstName: string;
  lastName: string;
  email: string;
  enrollmentNumber: string;
  departmentId: IdType;
  semesterId: IdType;
  divisionId: IdType;
}

/**
 * Data for updating an existing student (all fields optional).
 */
export interface UpdateStudentData {
  firstName?: string;
  lastName?: string;
  email?: string;
  enrollmentNumber?: string;
  departmentId?: IdType;
  semesterId?: IdType;
  divisionId?: IdType;
}

/**
 * Data structure for batch creation of students.
 */
export interface BatchCreateStudentInput {
  students: CreateStudentData[];
}

/**
 * @file src/interfaces/subjectAllocation.ts
 * @description Interfaces for Subject Allocation entity and related API data
 */

import { IdType } from "./common";
import { Subject } from "./subject";
import { Faculty } from "./faculty";
import { Division } from "./division";
import { Semester } from "./semester";
import { Department } from "./department";
import { AcademicYear } from "./academicYear";

/**
 * Lecture type enum matching backend
 */
export type LectureType = "LECTURE" | "LAB" | "TUTORIAL" | "SEMINAR" | "PROJECT";

/**
 * Represents a subject allocation entity.
 */
export interface SubjectAllocation {
  id: IdType;
  subjectId: IdType;
  facultyId: IdType;
  divisionId: IdType;
  semesterId: IdType;
  departmentId: IdType;
  academicYearId: IdType;
  lectureType: LectureType;
  batch: string;
  subject?: Subject;
  faculty?: Faculty;
  division?: Division;
  semester?: Semester;
  department?: Department;
  academicYear?: AcademicYear;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Data required to create a new subject allocation.
 */
export interface CreateSubjectAllocationData {
  subjectId: IdType;
  facultyId: IdType;
  divisionId: IdType;
}

/**
 * Data for updating an existing subject allocation (all fields optional).
 */
export interface UpdateSubjectAllocationData {
  subjectId?: IdType;
  facultyId?: IdType;
  divisionId?: IdType;
  isActive?: boolean;
}

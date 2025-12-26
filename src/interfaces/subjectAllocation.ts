/**
 * @file src/interfaces/subjectAllocation.ts
 * @description Interfaces for Subject Allocation entity and related API data
 */

import { IdType } from "./common";
import { Subject } from "./subject";
import { Faculty } from "./faculty";
import { Division } from "./division";

/**
 * Represents a subject allocation entity.
 */
export interface SubjectAllocation {
  id: IdType;
  subjectId: IdType;
  facultyId: IdType;
  divisionId: IdType;
  subject?: Subject;
  faculty?: Faculty;
  division?: Division;
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

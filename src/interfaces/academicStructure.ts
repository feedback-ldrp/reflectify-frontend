// src/interfaces/academicStructure.ts
import { IdType } from "./common";
import { Subject } from "./subject";

// Academic year information included in the academic structure
export interface AcademicYearInfo {
  id: IdType;
  yearString: string;
  isActive: boolean;
}

// A division with all its properties
export interface AcademicDivision {
  id: IdType;
  divisionName: string;
  studentCount: number;
  departmentId: IdType;
  semesterId: IdType;
  // Add any other relevant division properties
}

// A semester with academic year information and divisions
export interface AcademicSemester {
  id: IdType;
  semesterNumber: number;
  departmentId: IdType;
  academicYearId: IdType;
  semesterType: string;
  academicYear: AcademicYearInfo; // Nested academic year information
  divisions: AcademicDivision[]; // Divisions under this semester
  subjects?: Subject[]; // Subjects offered in this semester (if needed)
  // Add any other relevant semester properties
}

// Department with nested semesters that include academic year information
export interface DepartmentWithAcademicStructure {
  id: IdType;
  name: string;
  abbreviation: string;
  hodName: string;
  hodEmail: string;
  collegeId: IdType;
  semesters: AcademicSemester[]; // Semesters with academic year info and divisions
  // Add any other relevant department properties
}

// The type that represents the complete academic structure
export type AcademicStructureData = DepartmentWithAcademicStructure[];

// ...existing code...

// Parameters for fetching academic structure
export interface AcademicStructureParams {
  academicYearId?: string;
}

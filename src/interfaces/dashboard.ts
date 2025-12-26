/**
 * @file src/interfaces/dashboard.ts
 * @description Interface for dashboard statistics summary
 */

/**
 * Dashboard statistics summary for main dashboard widgets.
 */
export interface DashboardStats {
  responseCount: number;
  facultyCount: number;
  subjectCount: number;
  studentCount: number;
  departmentCount: number;
  divisionCount: number;
  semesterCount: number;
  academicYearCount: number;
  activeAcademicYear?: {
    id: string;
    yearString: string;
  };
}

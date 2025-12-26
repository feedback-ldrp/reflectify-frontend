/**
 * @file src/interfaces/upload.ts
 * @description Interfaces for upload results, file upload routes, and related data
 */

/**
 * Generic interface for upload results that return a message and rows affected.
 */
export interface UploadResult {
  message: string;
  rowsAffected: number;
  status?: string;
  error?: string | { [key: string]: any };
}

/**
 * Interface for details about a skipped row in the Faculty Matrix upload.
 */
export interface SkippedRowDetail {
  rowNumber: number;
  reason: string;
  data: any;
}

/**
 * Specific interface for the Faculty Matrix upload result, extending UploadResult.
 */
export interface FacultyMatrixUploadResult extends UploadResult {
  totalRowsSkippedDueToMissingEntities: number;
  missingFaculties: string[];
  missingSubjects: string[];
  skippedRowsDetails: string[];
  flaskWarnings: string[];
  flaskErrors: string[];
  flaskSuccess: boolean;
}

/**
 * Structure for a single row of faculty data as extracted from Excel and validated on frontend.
 */
export interface FacultyExcelRowData {
  name: string;
  email: string;
  facultyAbbreviation: string | null;
  designationString: string;
  deptInput: string;
  joiningDate: string | Date | null;
}

/**
 * Structure for upload data (key-value pairs).
 */
export interface UploadData {
  [key: string]: string | number | boolean | null;
}

/**
 * Structure of data sent to the preview table.
 */
export interface TableData {
  data: UploadData[];
  type: string;
}

/**
 * Structure for each entry in the FILE_ROUTES constant.
 */
export interface FileUploadRoute {
  route: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  requiredParams?: string[];
  referenceFileUrl?: string;
  description?: string;
}

/**
 * Parameters specific to Faculty Matrix Upload.
 */
export interface FacultyMatrixUploadParams {
  academicYear: string;
  semesterRun: string;
  deptAbbreviation: string;
}

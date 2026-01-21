/**
 * Analytics Export Utilities
 * Functions for exporting analytics data to CSV and Excel formats
 */

// ==================== CSV EXPORT ====================

export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T | string; header: string }[]
): void {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Determine columns from first row if not provided
  const exportColumns = columns || Object.keys(data[0]).map((key) => ({
    key,
    header: formatHeaderFromKey(key),
  }));

  // Build CSV content
  const headers = exportColumns.map((col) => escapeCSV(col.header)).join(",");
  const rows = data.map((row) =>
    exportColumns
      .map((col) => {
        const value = getNestedValue(row, String(col.key));
        return escapeCSV(formatValueForExport(value));
      })
      .join(",")
  );

  const csvContent = [headers, ...rows].join("\n");

  // Download file
  downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8;");
}

// ==================== EXCEL EXPORT ====================

export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = "Data",
  columns?: { key: keyof T | string; header: string }[]
): Promise<void> {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Dynamically import xlsx library
  const XLSX = await import("xlsx");

  // Determine columns from first row if not provided
  const exportColumns = columns || Object.keys(data[0]).map((key) => ({
    key,
    header: formatHeaderFromKey(key),
  }));

  // Transform data to array of arrays
  const headers = exportColumns.map((col) => col.header);
  const rows = data.map((row) =>
    exportColumns.map((col) => {
      const value = getNestedValue(row, String(col.key));
      return formatValueForExport(value);
    })
  );

  // Create workbook and worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Auto-size columns
  const maxWidths = exportColumns.map((col, i) => {
    const headerWidth = col.header.length;
    const maxDataWidth = Math.max(
      ...rows.map((row) => String(row[i] || "").length)
    );
    return Math.min(Math.max(headerWidth, maxDataWidth) + 2, 50);
  });
  worksheet["!cols"] = maxWidths.map((width) => ({ wch: width }));

  // Generate and download
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// ==================== MULTI-SHEET EXCEL EXPORT ====================

export async function exportToExcelMultiSheet(
  sheets: Array<{
    name: string;
    data: Record<string, any>[];
    columns?: { key: string; header: string }[];
  }>,
  filename: string
): Promise<void> {
  if (sheets.length === 0) {
    console.warn("No sheets to export");
    return;
  }

  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();

  sheets.forEach((sheet) => {
    if (sheet.data.length === 0) return;

    const exportColumns = sheet.columns || Object.keys(sheet.data[0]).map((key) => ({
      key,
      header: formatHeaderFromKey(key),
    }));

    const headers = exportColumns.map((col) => col.header);
    const rows = sheet.data.map((row) =>
      exportColumns.map((col) => {
        const value = getNestedValue(row, col.key);
        return formatValueForExport(value);
      })
    );

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    
    // Auto-size columns
    const maxWidths = exportColumns.map((col, i) => {
      const headerWidth = col.header.length;
      const maxDataWidth = Math.max(
        ...rows.map((row) => String(row[i] || "").length)
      );
      return Math.min(Math.max(headerWidth, maxDataWidth) + 2, 50);
    });
    worksheet["!cols"] = maxWidths.map((width) => ({ wch: width }));

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.substring(0, 31)); // Excel sheet name limit
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// ==================== SPECIFIC ANALYTICS EXPORTERS ====================

export interface SubjectExportData {
  subject: { name: string; code: string };
  overallRating: number;
  totalResponses: number;
  facultyBreakdown: Array<{
    facultyName: string;
    lectureType: string;
    rating: number;
    responses: number;
    divisions: string[];
  }>;
  divisionBreakdown: Array<{
    divisionName: string;
    lectureRating: number | null;
    labRating: number | null;
    totalRating: number;
    responses: number;
  }>;
}

export async function exportSubjectDetails(
  data: SubjectExportData,
  filename?: string
): Promise<void> {
  const sheets = [
    {
      name: "Summary",
      data: [
        {
          Subject: data.subject.name,
          Code: data.subject.code,
          "Overall Rating": data.overallRating,
          "Total Responses": data.totalResponses,
        },
      ],
    },
    {
      name: "Faculty Breakdown",
      data: data.facultyBreakdown.map((f) => ({
        Faculty: f.facultyName,
        Type: f.lectureType,
        Rating: f.rating,
        Responses: f.responses,
        Divisions: f.divisions.join(", "),
      })),
    },
    {
      name: "Division Breakdown",
      data: data.divisionBreakdown.map((d) => ({
        Division: d.divisionName,
        "Lecture Rating": d.lectureRating || "N/A",
        "Lab Rating": d.labRating || "N/A",
        "Overall Rating": d.totalRating,
        Responses: d.responses,
      })),
    },
  ];

  await exportToExcelMultiSheet(
    sheets,
    filename || `Subject_${data.subject.name.replace(/\s+/g, "_")}_Analytics`
  );
}

export interface FacultyExportData {
  faculty: { name: string; designation: string };
  overallRating: number;
  totalResponses: number;
  rank: number;
  totalFaculty: number;
  subjectBreakdown: Array<{
    subjectName: string;
    lectureType: string;
    rating: number;
    responses: number;
    semester: number;
    academicYear: string;
  }>;
  divisionBreakdown: Array<{
    divisionName: string;
    subjectName: string;
    lectureType: string;
    rating: number;
    responses: number;
  }>;
}

export async function exportFacultyDetails(
  data: FacultyExportData,
  filename?: string
): Promise<void> {
  const sheets = [
    {
      name: "Summary",
      data: [
        {
          Faculty: data.faculty.name,
          Designation: data.faculty.designation,
          "Overall Rating": data.overallRating,
          "Total Responses": data.totalResponses,
          Rank: `${data.rank} of ${data.totalFaculty}`,
        },
      ],
    },
    {
      name: "Subject Performance",
      data: data.subjectBreakdown.map((s) => ({
        Subject: s.subjectName,
        Type: s.lectureType,
        Rating: s.rating,
        Responses: s.responses,
        Semester: s.semester,
        "Academic Year": s.academicYear,
      })),
    },
    {
      name: "Division Breakdown",
      data: data.divisionBreakdown.map((d) => ({
        Division: d.divisionName,
        Subject: d.subjectName,
        Type: d.lectureType,
        Rating: d.rating,
        Responses: d.responses,
      })),
    },
  ];

  await exportToExcelMultiSheet(
    sheets,
    filename || `Faculty_${data.faculty.name.replace(/\s+/g, "_")}_Analytics`
  );
}

export interface DivisionExportData {
  division: { name: string; departmentName: string; semesterNumber: number };
  overallRating: number;
  totalResponses: number;
  facultyBreakdown: Array<{
    facultyName: string;
    subjectName: string;
    lectureType: string;
    rating: number;
    responses: number;
  }>;
  subjectBreakdown: Array<{
    subjectName: string;
    lectureRating: number | null;
    labRating: number | null;
    totalRating: number;
    responses: number;
  }>;
}

export async function exportDivisionDetails(
  data: DivisionExportData,
  filename?: string
): Promise<void> {
  const sheets = [
    {
      name: "Summary",
      data: [
        {
          Division: data.division.name,
          Department: data.division.departmentName,
          Semester: data.division.semesterNumber,
          "Overall Rating": data.overallRating,
          "Total Responses": data.totalResponses,
        },
      ],
    },
    {
      name: "Faculty Performance",
      data: data.facultyBreakdown.map((f) => ({
        Faculty: f.facultyName,
        Subject: f.subjectName,
        Type: f.lectureType,
        Rating: f.rating,
        Responses: f.responses,
      })),
    },
    {
      name: "Subject Breakdown",
      data: data.subjectBreakdown.map((s) => ({
        Subject: s.subjectName,
        "Lecture Rating": s.lectureRating || "N/A",
        "Lab Rating": s.labRating || "N/A",
        "Overall Rating": s.totalRating,
        Responses: s.responses,
      })),
    },
  ];

  await exportToExcelMultiSheet(
    sheets,
    filename || `Division_${data.division.name.replace(/\s+/g, "_")}_Analytics`
  );
}

// ==================== HELPER FUNCTIONS ====================

function escapeCSV(value: string): string {
  // If value contains comma, newline, or quotes, wrap in quotes and escape quotes
  if (
    value.includes(",") ||
    value.includes("\n") ||
    value.includes('"') ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatValueForExport(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function formatHeaderFromKey(key: string): string {
  // Convert camelCase or snake_case to Title Case
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\s/, "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

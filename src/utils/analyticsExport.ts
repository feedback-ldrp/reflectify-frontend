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

  // Dynamically import exceljs library
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Determine columns from first row if not provided
  const exportColumns = columns || Object.keys(data[0]).map((key) => ({
    key,
    header: formatHeaderFromKey(key),
  }));

  // Set up worksheet columns
  worksheet.columns = exportColumns.map((col, i) => ({
    header: col.header,
    key: `col${i}`,
    width: Math.min(Math.max(col.header.length + 2, 12), 50),
  }));

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 11 };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE5E5E5" },
  };
  worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

  // Add data rows
  data.forEach((row) => {
    const rowData: Record<string, any> = {};
    exportColumns.forEach((col, i) => {
      const value = getNestedValue(row, String(col.key));
      rowData[`col${i}`] = formatValueForExport(value);
    });
    worksheet.addRow(rowData);
  });

  // Auto-size columns based on content
  worksheet.columns.forEach((column, i) => {
    let maxLength = exportColumns[i]?.header.length || 10;
    data.forEach((row) => {
      const value = getNestedValue(row, String(exportColumns[i]?.key || ""));
      const cellLength = String(formatValueForExport(value)).length;
      if (cellLength > maxLength) maxLength = cellLength;
    });
    column.width = Math.min(maxLength + 2, 50);
  });

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();

  sheets.forEach((sheet) => {
    if (sheet.data.length === 0) return;

    const exportColumns = sheet.columns || Object.keys(sheet.data[0]).map((key) => ({
      key,
      header: formatHeaderFromKey(key),
    }));

    const worksheet = workbook.addWorksheet(sheet.name.substring(0, 31)); // Excel sheet name limit

    // Set up worksheet columns
    worksheet.columns = exportColumns.map((col, i) => ({
      header: col.header,
      key: `col${i}`,
      width: Math.min(Math.max(col.header.length + 2, 12), 50),
    }));

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 11 };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E5E5" },
    };
    worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    // Add data rows
    sheet.data.forEach((row) => {
      const rowData: Record<string, any> = {};
      exportColumns.forEach((col, i) => {
        const value = getNestedValue(row, col.key);
        rowData[`col${i}`] = formatValueForExport(value);
      });
      worksheet.addRow(rowData);
    });

    // Auto-size columns based on content
    worksheet.columns.forEach((column, i) => {
      let maxLength = exportColumns[i]?.header.length || 10;
      sheet.data.forEach((row) => {
        const value = getNestedValue(row, exportColumns[i]?.key || "");
        const cellLength = String(formatValueForExport(value)).length;
        if (cellLength > maxLength) maxLength = cellLength;
      });
      column.width = Math.min(maxLength + 2, 50);
    });
  });

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

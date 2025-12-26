/**
 * @file src/utils/facultyPerformanceExport.ts
 * @description Utility functions for exporting faculty performance data to CSV
 */

import { academicYearService } from "@/services/academicYear.service";
import { ANALYTICS_ENDPOINTS } from "@/constants/apiEndpoints";
import apiClient from "@/lib/axiosInstance";
import showToast from "@/lib/toast";

interface FacultyPerformanceExportData {
    "Sr. No.": number;
    "Faculty Name": string;
    "Semester 1": number | string;
    "Semester 2": number | string;
    "Semester 3": number | string;
    "Semester 4": number | string;
    "Semester 5": number | string;
    "Semester 6": number | string;
    "Semester 7": number | string;
    "Semester 8": number | string;
    Average: number | string;
    "Total Responses": number | string;
}

interface AllFacultyPerformanceApiResponse {
    academic_year: string;
    faculties: Array<{
        facultyId: string;
        Faculty_name: string;
        academic_year: string;
        total_average: number | null;
        total_responses?: number;
        "semester 1"?: number | null;
        "semester 2"?: number | null;
        "semester 3"?: number | null;
        "semester 4"?: number | null;
        "semester 5"?: number | null;
        "semester 6"?: number | null;
        "semester 7"?: number | null;
        "semester 8"?: number | null;
        [key: string]: any;
    }>;
}

/**
 * Fetches all faculty performance data for export
 */
export async function fetchFacultyPerformanceForExport(
    academicYearId?: string
): Promise<AllFacultyPerformanceApiResponse> {
    try {
        let targetAcademicYearId = academicYearId;

        // If no academicYearId provided, get the active academic year
        if (!targetAcademicYearId) {
            const activeYear =
                await academicYearService.getActiveAcademicYear();
            if (!activeYear) {
                throw new Error("No active academic year found");
            }
            targetAcademicYearId = activeYear.id;
        }

        // Make API call to get detailed faculty performance data
        const response = await apiClient.get(
            ANALYTICS_ENDPOINTS.GET_ALL_FACULTY_PERFORMANCE_DATA(
                targetAcademicYearId
            )
        );

        return (response.data as { data: AllFacultyPerformanceApiResponse })
            .data;
    } catch (error) {
        showToast.error(
            "Error fetching faculty performance data for export: " + error
        );
        throw error;
    }
}

/**
 * Transforms API response to export format
 */
export function transformDataForExport(
    apiData: AllFacultyPerformanceApiResponse
): FacultyPerformanceExportData[] {
    return apiData.faculties.map((faculty, index) => {
        // Extract abbreviation from faculty name (assuming format like "John Doe (JD)")
        // const abbreviationMatch = faculty.Faculty_name.match(/\(([^)]+)\)$/);
        const cleanName = faculty.Faculty_name.replace(
            /\s*\([^)]+\)$/,
            ""
        ).trim();

        // Use actual total responses if available, otherwise calculate approximation
        const totalResponses =
            faculty.total_responses ??
            (() => {
                // Calculate total responses from available semester data as fallback
                const semesterValues = [
                    faculty["semester 1"],
                    faculty["semester 2"],
                    faculty["semester 3"],
                    faculty["semester 4"],
                    faculty["semester 5"],
                    faculty["semester 6"],
                    faculty["semester 7"],
                    faculty["semester 8"],
                ].filter((val) => val !== null && val !== undefined);

                return semesterValues.length > 0
                    ? `~${semesterValues.length * 25}`
                    : "0";
            })();

        return {
            "Sr. No.": index + 1,
            "Faculty Name": cleanName,
            "Semester 1": faculty["semester 1"] ?? "0",
            "Semester 2": faculty["semester 2"] ?? "0",
            "Semester 3": faculty["semester 3"] ?? "0",
            "Semester 4": faculty["semester 4"] ?? "0",
            "Semester 5": faculty["semester 5"] ?? "0",
            "Semester 6": faculty["semester 6"] ?? "0",
            "Semester 7": faculty["semester 7"] ?? "0",
            "Semester 8": faculty["semester 8"] ?? "0",
            Average: faculty.total_average ?? "N/A",
            "Total Responses": totalResponses,
        };
    });
}

/**
 * Converts data to CSV format with proper escaping
 */
export function convertToCSV(data: FacultyPerformanceExportData[]): string {
    if (data.length === 0) return "";

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Helper function to escape CSV values
    const escapeCSVValue = (value: any): string => {
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        // If value contains comma, quote, or newline, wrap in quotes and escape quotes
        if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
        ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    // Create CSV content
    const csvContent = [
        // Header row
        headers.map((header) => escapeCSVValue(header)).join(","),
        // Data rows
        ...data.map((row) =>
            headers
                .map((header) =>
                    escapeCSVValue(
                        row[header as keyof FacultyPerformanceExportData]
                    )
                )
                .join(",")
        ),
    ].join("\n");

    return csvContent;
}

/**
 * Downloads file (CSV) with improved error handling and browser compatibility
 */
export function downloadFile(content: string, filename: string): void {
    try {
        // Add BOM for better Excel compatibility
        const BOM = "\uFEFF";
        const csvWithBOM = BOM + content;

        const blob = new Blob([csvWithBOM], {
            type: "text/csv;charset=utf-8;",
        });

        // Check if browser supports download attribute
        const link = document.createElement("a");

        if (typeof link.download !== "undefined") {
            // Modern browsers
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            link.style.display = "none";

            // Append to body temporarily
            document.body.appendChild(link);

            // Trigger download
            link.click();

            // Clean up with longer delay to ensure download starts
            setTimeout(() => {
                if (document.body.contains(link)) {
                    document.body.removeChild(link);
                }
                URL.revokeObjectURL(url);
            }, 500); // Increased delay to 500ms
        } else {
            // Fallback for older browsers
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
    } catch (error) {
        showToast.error("Failed to download file: " + error);

        // Final fallback - create data URL
        try {
            const dataUrl =
                "data:text/csv;charset=utf-8," + encodeURIComponent(content);
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (fallbackError) {
            showToast.error("Failed to download file: " + fallbackError);
            throw new Error(
                "Unable to download file. Please try again or check your browser settings."
            );
        }
    }
}

/**
 * Downloads CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
    downloadFile(csvContent, filename); // Removed mimeType parameter
}

/**
 * Test function to verify download functionality
 */
export function testDownload(): void {
    const testData = "Test,CSV,Data\n1,Hello,World\n2,Test,Download";
    const filename = `test_download_${Date.now()}.csv`;

    downloadCSV(testData, filename);
}

/**
 * Main export function
 */
export async function exportFacultyPerformanceData(
    academicYearId?: string // Removed format parameter
): Promise<void> {
    try {
        // Show loading state (you might want to implement this in the component)

        // Fetch data
        const apiData = await fetchFacultyPerformanceForExport(academicYearId);

        if (!apiData.faculties || apiData.faculties.length === 0) {
            throw new Error("No faculty performance data available for export");
        }

        // Transform data
        const exportData = transformDataForExport(apiData);

        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const filename = `faculty_performance_${apiData.academic_year.replace(
            /[^a-zA-Z0-9]/g,
            "_"
        )}_${timestamp}.csv`;

        const csvContent = convertToCSV(exportData);

        downloadCSV(csvContent, filename);
    } catch (error) {
        showToast.error("Error exporting faculty performance data: " + error);
        throw error;
    }
}

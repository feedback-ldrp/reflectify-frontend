/**
@file src/hooks/upload/useFileUpload.ts
@description File upload hook for Excel files, preview, and faculty matrix upload logic
*/
import { useState, useCallback } from "react";
import { showToast } from "@/lib/toast";
import ExcelJS from "exceljs";
import {
    UploadData,
    TableData,
    FacultyMatrixUploadParams,
    UploadResult,
    FacultyMatrixUploadResult,
} from "@/interfaces/upload";
import { FILE_ROUTES } from "@/constants/fileUploadRoutes";
import uploadService from "@/services/uploadService";
import { SemesterTypeEnum } from "@/constants/semesterTypes";
import { ToastOptions } from "react-hot-toast";

// Return type for the file upload hook
interface UseFileUploadResult {
    files: { [key: string]: File | null };
    loadingStates: { [key: string]: boolean };
    activeTable: TableData | null;
    facultyMatrixParams: FacultyMatrixUploadParams;
    handleFileChange: (
        event: React.ChangeEvent<HTMLInputElement>,
        fileKey: string
    ) => void;
    handleClearFile: (fileKey: string) => void;
    handlePreview: (fileKey: string) => Promise<void>;
    handleSubmitUpload: (fileKey: string) => Promise<void>;
    setFacultyMatrixParams: React.Dispatch<
        React.SetStateAction<FacultyMatrixUploadParams>
    >;
}

export const useFileUpload = (): UseFileUploadResult => {
    // State for selected files
    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        studentData: null,
        facultyData: null,
        subjectData: null,
        facultyMatrix: null,
    });

    // State for loading indicators
    const [loadingStates, setLoadingStates] = useState<{
        [key: string]: boolean;
    }>({
        studentData: false,
        facultyData: false,
        subjectData: false,
        facultyMatrix: false,
    });

    // State for preview table
    const [activeTable, setActiveTable] = useState<TableData | null>(null);

    // State for faculty matrix upload params
    const [facultyMatrixParams, setFacultyMatrixParams] =
        useState<FacultyMatrixUploadParams>({
            academicYear: "",
            semesterRun: "",
            deptAbbreviation: "",
        });

    // Handle file input change
    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>, fileKey: string) => {
            const file = event.target.files?.[0] || null;
            if (file && !file.name.match(/\.(xlsx|xls)$/)) {
                showToast.error("Please upload only Excel files (.xlsx, .xls)");
                event.target.value = "";
                return;
            }
            setFiles((prev) => ({ ...prev, [fileKey]: file }));
            setActiveTable(null);
            if (fileKey === "facultyMatrix") {
                setFacultyMatrixParams({
                    academicYear: "",
                    semesterRun: "",
                    deptAbbreviation: "",
                });
            }
        },
        []
    );

    // Handle clearing a file input
    const handleClearFile = useCallback((fileKey: string) => {
        const fileInput = document.querySelector(
            `input[name="${fileKey}"]`
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        setFiles((prev) => ({ ...prev, [fileKey]: null }));
        setActiveTable(null);
        if (fileKey === "facultyMatrix") {
            setFacultyMatrixParams({
                academicYear: "",
                semesterRun: "",
                deptAbbreviation: "",
            });
        }
    }, []);

    // Handle previewing the Excel file
    const handlePreview = useCallback(
        async (fileKey: string) => {
            const file = files[fileKey];
            if (!file) {
                showToast.error("Please select a file first to preview.");
                return;
            }
            try {
                const workbook = new ExcelJS.Workbook();
                const arrayBuffer = await file.arrayBuffer();
                await workbook.xlsx.load(arrayBuffer);
                const worksheet = workbook.worksheets[0];
                if (
                    !worksheet ||
                    worksheet.actualRowCount < 1 ||
                    worksheet.actualColumnCount < 1
                ) {
                    showToast.error("Excel file is empty or has no data.");
                    setActiveTable(null);
                    return;
                }
                const rawValuesFromRow1 = worksheet.getRow(1).values;
                const rawHeaderValues: (ExcelJS.CellValue | undefined)[] =
                    Array.isArray(rawValuesFromRow1) ? rawValuesFromRow1 : [];
                const headers: string[] = rawHeaderValues
                    .map((value: ExcelJS.CellValue | undefined): string => {
                        if (value instanceof Date) {
                            return value.toISOString().split("T")[0];
                        } else if (
                            typeof value === "object" &&
                            value !== null
                        ) {
                            if (
                                "text" in value &&
                                typeof (value as { text: any }).text ===
                                    "string"
                            ) {
                                return (value as { text: string }).text;
                            }
                            if ("result" in value) {
                                return (
                                    (
                                        value as { result: any }
                                    ).result?.toString() ?? ""
                                );
                            }
                            return String(value);
                        } else if (
                            value === null ||
                            typeof value === "undefined"
                        ) {
                            return "";
                        } else {
                            return String(value);
                        }
                    })
                    .filter((value: string): boolean => value.trim() !== "")
                    .map((header: string): string => header.trim());
                if (headers.length === 0) {
                    showToast.error(
                        "Excel file is empty or has no headers after processing."
                    );
                    setActiveTable(null);
                    return;
                }
                const jsonData: UploadData[] = [];
                worksheet.eachRow((row, rowNumber) => {
                    if (rowNumber > 1) {
                        const rowData: UploadData = {};
                        headers.forEach((headerName, index) => {
                            const cell = row.getCell(index + 1);
                            if (cell.value instanceof Date) {
                                rowData[headerName] = cell.value
                                    .toISOString()
                                    .split("T")[0];
                            } else if (
                                typeof cell.value === "object" &&
                                cell.value !== null &&
                                "text" in cell.value
                            ) {
                                rowData[headerName] =
                                    (
                                        cell.value as { text: any }
                                    ).text?.toString() ?? null;
                            } else {
                                rowData[headerName] =
                                    cell.value?.toString() ?? null;
                            }
                        });
                        // Only add rows that have at least one non-empty value
                        if (
                            Object.values(rowData).some(
                                (value) => value !== null && value !== ""
                            )
                        ) {
                            jsonData.push(rowData);
                        }
                    }
                });
                if (jsonData.length === 0) {
                    showToast.error(
                        "No data found in the Excel file after headers."
                    );
                    setActiveTable(null);
                    return;
                }
                setActiveTable({
                    data: jsonData,
                    type: FILE_ROUTES[fileKey as keyof typeof FILE_ROUTES]
                        .label,
                });
                showToast.success(
                    `Preview generated for ${
                        FILE_ROUTES[fileKey as keyof typeof FILE_ROUTES].label
                    }`
                );
            } catch {
                showToast.error(
                    "Failed to preview file. Ensure it's a valid Excel format and not corrupted."
                );
                setActiveTable(null);
            }
        },
        [files]
    );

    // Handle uploading the file
    const handleSubmitUpload = useCallback(
        async (fileKey: string) => {
            const file = files[fileKey];
            if (!file) {
                showToast.error("Please select a file to upload.");
                return;
            }
            setLoadingStates((prev) => ({ ...prev, [fileKey]: true }));
            try {
                let response: UploadResult | FacultyMatrixUploadResult;
                if (fileKey === "facultyMatrix") {
                    if (
                        !facultyMatrixParams.academicYear ||
                        !facultyMatrixParams.semesterRun ||
                        !facultyMatrixParams.deptAbbreviation
                    ) {
                        showToast.error(
                            "Please fill all required fields for Faculty Matrix upload."
                        );
                        setLoadingStates((prev) => ({
                            ...prev,
                            [fileKey]: false,
                        }));
                        return;
                    }
                    response = await uploadService.uploadFacultyMatrix(
                        file,
                        facultyMatrixParams.academicYear,
                        facultyMatrixParams.semesterRun as SemesterTypeEnum,
                        facultyMatrixParams.deptAbbreviation
                    );
                    const facultyMatrixResponse =
                        response as FacultyMatrixUploadResult;
                    const infoMessage = `Uploaded ${FILE_ROUTES[fileKey].label}. Affected ${facultyMatrixResponse.rowsAffected} rows.`;
                    if (facultyMatrixResponse.flaskSuccess) {
                        showToast.success(`Success! ${infoMessage}`);
                    } else {
                        showToast.info(
                            `${infoMessage} but found some issues. Please review the following warnings and errors.`,
                            { duration: 15000 } as ToastOptions
                        );
                    }
                    if (
                        facultyMatrixResponse.flaskWarnings &&
                        facultyMatrixResponse.flaskWarnings.length > 0
                    ) {
                        facultyMatrixResponse.flaskWarnings.forEach(
                            (warning) => {
                                showToast.warning(warning, {
                                    duration: 15000,
                                } as ToastOptions);
                            }
                        );
                    }
                    if (
                        facultyMatrixResponse.flaskErrors &&
                        facultyMatrixResponse.flaskErrors.length > 0
                    ) {
                        facultyMatrixResponse.flaskErrors.forEach((error) => {
                            showToast.error(error, {
                                duration: 15000,
                            } as ToastOptions);
                        });
                    }
                } else {
                    response = await uploadService.uploadFile(
                        fileKey as keyof typeof FILE_ROUTES,
                        file
                    );
                    showToast.success(
                        `Success! Uploaded ${FILE_ROUTES[fileKey].label}. Affected ${response.rowsAffected} rows.`
                    );
                }
                handleClearFile(fileKey);
            } catch (error: any) {
                showToast.error(
                    error.message ||
                        "An unexpected error occurred during upload."
                );
            } finally {
                setLoadingStates((prev) => ({ ...prev, [fileKey]: false }));
            }
        },
        [files, handleClearFile, facultyMatrixParams]
    );

    return {
        files,
        loadingStates,
        activeTable,
        facultyMatrixParams,
        handleFileChange,
        handleClearFile,
        handlePreview,
        handleSubmitUpload,
        setFacultyMatrixParams,
    };
};

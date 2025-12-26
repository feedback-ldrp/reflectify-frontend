// src/app/(main)/upload/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FILE_ROUTES } from "@/constants/fileUploadRoutes";
import { useFileUpload } from "@/hooks/upload/useFileUpload";
import { FileUploadCard } from "@/components/upload/FileUploadCard";
import { DataTable } from "@/components/ui/DataTable";
import {
    ArrowDownTrayIcon,
    CircleStackIcon,
    DocumentArrowUpIcon,
    TableCellsIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import {
    Button,
    Card,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui";
import { FacultyMatrixUploadInputs } from "@/components/upload/FacultyMatrixUploadInputs";
import { REFERENCE_FILE_URLS } from "@/constants/apiEndpoints";

export default function UploadPage() {
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState<
        "Faculty Matrix" | "Data Upload"
    >("Faculty Matrix");

    const {
        files,
        loadingStates,
        activeTable,
        facultyMatrixParams,
        handleFileChange,
        handleClearFile,
        handlePreview,
        handleSubmitUpload,
        setFacultyMatrixParams,
    } = useFileUpload();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    // For debugging pagination - create extended test data when there's little data
    const getTableDataForDisplay = () => {
        if (!activeTable) return null;

        // If there's less than 30 rows, duplicate some rows for pagination testing
        const displayData = [...activeTable.data];

        return {
            ...activeTable,
            data: displayData,
        };
    };

    const handleParamChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFacultyMatrixParams((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const facultyMatrixRoute = FILE_ROUTES.facultyMatrix;
    const file = files.facultyMatrix;
    const isLoading = loadingStates.facultyMatrix;

    const canSubmit =
        file &&
        facultyMatrixParams.academicYear &&
        facultyMatrixParams.semesterRun &&
        facultyMatrixParams.deptAbbreviation;

    // Reference file Google Drive link - you can update this with your actual link
    const referenceFileUrl = REFERENCE_FILE_URLS.FACULTY_MATRIX;

    if (!isClient) {
        return null;
    }

    const displayTable = getTableDataForDisplay();

    return (
        <div className="bg-light-muted-background dark:bg-dark-background">
            <div className="max-w-[1920px] mx-auto px-6 py-6">
                <div className="space-y-4">
                    <motion.div className="bg-light-background dark:bg-dark-muted-background p-6 rounded-xl shadow-sm border border-light-secondary dark:border-dark-secondary">
                        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            {/* Left Section: Title and Descriptions */}
                            <div>
                                {/* Responsive text sizing */}
                                <h1 className="text-3xl md:text-4xl font-extrabold text-light-text dark:text-dark-text flex items-center gap-3">
                                    Data Upload
                                </h1>
                                <p className="text-base text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2">
                                    <DocumentArrowUpIcon className="h-6 w-6 text-positive-main" />
                                    Upload and preview academic data files
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <Card className="bg-light-background dark:bg-dark-muted-background border border-light-secondary dark:border-dark-secondary rounded-2xl shadow-sm p-4">
                        <Tabs
                            value={activeTab}
                            onValueChange={(value: string) =>
                                setActiveTab(value as any)
                            }
                        >
                            <div className="pb-6 border-b border-light-secondary dark:border-dark-secondary">
                                <TabsList className="grid w-full grid-cols-2 gap-4 rounded-xl p-1">
                                    <TabsTrigger
                                        value="Faculty Matrix"
                                        className="flex items-center gap-2 text-md py-2"
                                    >
                                        <TableCellsIcon className="w-6 h-6" />
                                        Upload Faculty Matrix
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="Data Upload"
                                        className="flex items-center gap-2 text-md py-2"
                                    >
                                        <CircleStackIcon className="w-6 h-6" />
                                        Upload Academic Data
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <div>
                                <TabsContent
                                    value="Faculty Matrix"
                                    className="space-y-6"
                                >
                                    <div className="bg-light-background dark:bg-dark-muted-background">
                                        <div className="grid grid-cols-3 gap-4">
                                            {/* Faculty Matrix Upload Card */}
                                            <Card className="bg-light-background dark:bg-dark-muted-background shadow-sm border border-light-secondary dark:border-dark-secondary p-6 rounded-2xl">
                                                <div className="space-y-6">
                                                    {/* Header with icon */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-light-secondary dark:bg-dark-secondary rounded-xl">
                                                                <DocumentArrowUpIcon className="h-6 w-6 text-light-highlight dark:text-dark-highlight" />
                                                            </div>
                                                            <div>
                                                                <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                                                                    {
                                                                        facultyMatrixRoute.label
                                                                    }
                                                                </h2>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    Upload
                                                                    faculty
                                                                    teaching
                                                                    assignments
                                                                    and
                                                                    schedules
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Reference File Download */}
                                                        <Button
                                                            onClick={() =>
                                                                window.open(
                                                                    referenceFileUrl,
                                                                    "_blank"
                                                                )
                                                            }
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-lg hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
                                                            title="Download reference file"
                                                        >
                                                            <ArrowDownTrayIcon className="h-5 w-5" />
                                                            File Format
                                                        </Button>
                                                    </div>

                                                    {/* File Upload */}
                                                    <div>
                                                        <input
                                                            name="facultyMatrix"
                                                            type="file"
                                                            accept=".xlsx,.xls"
                                                            title="Upload Faculty Matrix Excel file"
                                                            placeholder="Choose Faculty Matrix Excel file"
                                                            onChange={(e) =>
                                                                handleFileChange(
                                                                    e,
                                                                    "facultyMatrix"
                                                                )
                                                            }
                                                            className="block w-full text-sm text-light-muted-text dark:text-dark-muted-text
                                    file:mr-4 file:py-2.5 file:px-4
                                    file:rounded-xl file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-light-secondary file:dark:bg-dark-secondary file:text-light-highlight file:dark:text-dark-highlight
                                    transition-all cursor-pointer
                                    hover:file:bg-light-hover hover:dark:file:bg-dark-hover"
                                                        />
                                                    </div>

                                                    {/* File Info */}
                                                    {file && (
                                                        <div className="flex items-center justify-between rounded-lg">
                                                            <p className="text-sm text-primary-dark font-medium flex items-center gap-2 truncate max-w-[60%]">
                                                                <span className="w-2 h-2 bg-light-highlight dark:bg-dark-highlight rounded-full flex-shrink-0"></span>
                                                                <span className="truncate">
                                                                    {file.name}
                                                                </span>
                                                            </p>
                                                            <button
                                                                onClick={() =>
                                                                    handleClearFile(
                                                                        "facultyMatrix"
                                                                    )
                                                                }
                                                                className="p-1.5 hover:bg-light-hover dark:hover:bg-dark-hover rounded-full transition-colors flex-shrink-0"
                                                                title="Clear file"
                                                                aria-label="Clear file"
                                                            >
                                                                <XMarkIcon className="h-4 w-4 text-light-tertiary dark:text-dark-tertiary" />
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Faculty Matrix Upload Inputs */}
                                                    <FacultyMatrixUploadInputs
                                                        params={
                                                            facultyMatrixParams
                                                        }
                                                        onParamChange={
                                                            handleParamChange
                                                        }
                                                    />

                                                    {/* Action Buttons */}
                                                    <div className="flex flex-col sm:flex-row gap-3">
                                                        <button
                                                            onClick={() =>
                                                                handlePreview(
                                                                    "facultyMatrix"
                                                                )
                                                            }
                                                            disabled={!file}
                                                            className="flex-1 bg-transparent border-2 border-primary-main text-light-highlight dark:text-dark-highlight py-2.5 px-4 rounded-xl
                            hover:bg-primary-lighter focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                            transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            Preview Data
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleSubmitUpload(
                                                                    "facultyMatrix"
                                                                )
                                                            }
                                                            disabled={
                                                                !canSubmit ||
                                                                isLoading
                                                            }
                                                            className="flex-1 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                                            hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                                            transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isLoading ? (
                                                                <span className="flex items-center justify-center gap-2">
                                                                    {/* Loading Spinner */}
                                                                    <svg
                                                                        className="animate-spin h-5 w-5 text-white"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                    />
                                                                    Processing
                                                                </span>
                                                            ) : (
                                                                "Upload Faculty Matrix"
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Information Panel */}
                                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                                            Faculty Matrix
                                                            Upload Guidelines:
                                                        </h4>
                                                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                                            <li>
                                                                • Download the
                                                                reference file
                                                                to see the
                                                                required format
                                                            </li>
                                                            <li>
                                                                • Ensure all
                                                                faculty and
                                                                subject data is
                                                                uploaded before
                                                                matrix upload
                                                            </li>
                                                            <li>
                                                                • Select the
                                                                correct academic
                                                                year and
                                                                semester
                                                            </li>
                                                            <li>
                                                                • Verify
                                                                department
                                                                abbreviation
                                                                matches your
                                                                department code
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Preview Section - Full Width */}
                                            <div className="w-full col-span-2">
                                                <DataTable
                                                    data={
                                                        activeTable?.data || []
                                                    }
                                                    columns={[]}
                                                    autoGenerateColumns={true}
                                                    previewMode={true}
                                                    previewTitle={
                                                        activeTable
                                                            ? `${activeTable.type} Preview`
                                                            : undefined
                                                    }
                                                    previewIcon={TableCellsIcon}
                                                    showCard={true}
                                                    showSearch={
                                                        activeTable?.data &&
                                                        activeTable.data
                                                            .length > 20
                                                    }
                                                    showPagination={
                                                        activeTable?.data &&
                                                        activeTable.data
                                                            .length > 25
                                                    }
                                                    pageSize={10}
                                                    maxHeight="770px"
                                                    emptyMessage="Select a file and click preview to see the content"
                                                    searchPlaceholder="Search in file data..."
                                                    className="w-full"
                                                    stickyHeader={true}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value="Data Upload"
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        {/* Upload Cards Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                            {Object.entries(FILE_ROUTES)
                                                .filter(
                                                    ([key]) =>
                                                        key !==
                                                            "facultyMatrix" &&
                                                        key !== "studentData"
                                                ) // Exclude Faculty Matrix
                                                .map(([key, routeConfig]) => (
                                                    <FileUploadCard
                                                        key={key}
                                                        fileKey={key}
                                                        routeConfig={
                                                            routeConfig
                                                        }
                                                        file={files[key]}
                                                        isLoading={
                                                            loadingStates[key]
                                                        }
                                                        onFileChange={
                                                            handleFileChange
                                                        }
                                                        onClearFile={
                                                            handleClearFile
                                                        }
                                                        onPreview={
                                                            handlePreview
                                                        }
                                                        onSubmitUpload={
                                                            handleSubmitUpload
                                                        }
                                                    />
                                                ))}
                                        </div>
                                        <div className="w-full">
                                            {/* Stats Bar for Preview */}
                                            {displayTable &&
                                                displayTable.data.length >
                                                    0 && (
                                                    <div className="mb-4 p-4 bg-light-background dark:bg-dark-muted-background rounded-lg border border-light-secondary dark:border-dark-secondary">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                                                    <span className="font-semibold text-light-text dark:text-dark-text">
                                                                        {
                                                                            displayTable
                                                                                .data
                                                                                .length
                                                                        }
                                                                    </span>{" "}
                                                                    rows{" "}
                                                                    {displayTable
                                                                        .data
                                                                        .length !==
                                                                        (activeTable
                                                                            ?.data
                                                                            .length ||
                                                                            0) &&
                                                                        "(including test data)"}
                                                                </div>
                                                                <div className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                                                    <span className="font-semibold text-light-text dark:text-dark-text">
                                                                        {
                                                                            Object.keys(
                                                                                displayTable
                                                                                    .data[0] ||
                                                                                    {}
                                                                            )
                                                                                .length
                                                                        }
                                                                    </span>{" "}
                                                                    columns
                                                                </div>
                                                                <div className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                                                    <span className="font-semibold text-light-text dark:text-dark-text">
                                                                        {Math.ceil(
                                                                            displayTable
                                                                                .data
                                                                                .length /
                                                                                20
                                                                        )}
                                                                    </span>{" "}
                                                                    pages (Page
                                                                    size: 20)
                                                                </div>
                                                            </div>
                                                            <div className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                                                File Name:{" "}
                                                                <span className="font-semibold text-light-text dark:text-dark-text capitalize">
                                                                    {
                                                                        displayTable.type
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                            <DataTable
                                                data={displayTable?.data || []}
                                                columns={[]}
                                                autoGenerateColumns={true}
                                                previewMode={true}
                                                previewTitle={
                                                    displayTable
                                                        ? `${displayTable.type} Preview`
                                                        : undefined
                                                }
                                                previewIcon={TableCellsIcon}
                                                showCard={true}
                                                showSearch={
                                                    displayTable?.data &&
                                                    displayTable.data.length > 5
                                                }
                                                showPagination={true} // Always show pagination for debugging
                                                pageSize={10}
                                                emptyMessage="Select a file and click preview to see the content"
                                                searchPlaceholder="Search in file data..."
                                                className="w-full"
                                                stickyHeader={true}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </Card>
                </div>
            </div>
        </div>
    );
}

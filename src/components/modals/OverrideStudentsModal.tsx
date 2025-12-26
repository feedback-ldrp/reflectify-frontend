// src/components/modals/OverrideStudentsModal.tsx
"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    XMarkIcon,
    CloudArrowUpIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline";
import { showToast } from "@/lib/toast";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/common/Loader";
import overrideStudentsService from "@/services/overrideStudentsService";
import { OverrideStudentUploadResult as UploadOverrideStudentsResponse } from "@/interfaces/overrideStudent";
import { X } from "lucide-react";

interface OverrideStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    formId: string;
    onUploadSuccess: (result: UploadOverrideStudentsResponse) => void;
}

export default function OverrideStudentsModal({
    isOpen,
    onClose,
    formId,
    onUploadSuccess,
}: OverrideStudentsModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (selectedFile: File) => {
        // Validate file type
        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            showToast.error("Please select an Excel (.xlsx, .xls) or CSV file");
            return;
        }

        // Validate file size (5MB limit)
        if (selectedFile.size > 5 * 1024 * 1024) {
            showToast.error("File size must be less than 5MB");
            return;
        }

        setFile(selectedFile);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            showToast.error("Please select a file first");
            return;
        }

        setIsUploading(true);
        try {
            const result = await overrideStudentsService.uploadOverrideStudents(
                formId,
                file
            );

            onUploadSuccess(result);
            onClose();
            setFile(null);
        } catch (error: any) {
            showToast.error("Upload failed: " + error);
            showToast.error(
                error.response?.data?.message ||
                    "Failed to upload students data"
            );
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = () => {
        // Create a sample CSV template
        const csvContent = `Name,Email,Enrollment,Batch,Phone,Department,Semester
John Doe,john@example.com,12345,A,+1234567890,Computer Engineering,6
Jane Smith,jane@example.com,12346,B,+1234567891,Information Technology,6`;

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "override_students_template.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const resetModal = () => {
        setFile(null);
        setIsDragOver(false);
        setIsUploading(false);
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={handleClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative z-10 w-full max-w-2xl mx-4"
                >
                    <Card className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <UserGroupIcon className="w-8 h-8 text-light-text dark:text-dark-text" />
                                <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                                    Upload Override Students
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 rounded-lg hover:bg-light-secondary dark:hover:bg-dark-secondary transition-colors"
                                aria-label="Close modal"
                            >
                                <XMarkIcon className="w-6 h-6 text-light-muted-text dark:text-dark-muted-text" />
                            </button>
                        </div>

                        {/* Info Banner */}
                        <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                            <div className="flex gap-3 items-center">
                                <ExclamationTriangleIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                                        Students Information
                                    </p>
                                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                        This form will be sent only to the
                                        uploaded students data.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div className="mb-6">
                            <div
                                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${
                      isDragOver
                          ? "border-primary bg-primary/5"
                          : "border-light-secondary dark:border-dark-secondary hover:border-primary/50"
                  }
                  ${
                      file
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                          : ""
                  }
                `}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileInputChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    aria-label="Upload students file"
                                />

                                {file ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <CheckCircleIcon className="w-12 h-12 text-green-600" />
                                        <div>
                                            <p className="font-medium text-light-text dark:text-dark-text">
                                                {file.name}
                                            </p>
                                            <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                                {(
                                                    file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{" "}
                                                MB
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setFile(null)}
                                            className="flex py-2 px-3 items-center gap-1 bg-transparent border rounded-xl border-red-600 text-sm
               text-red-600 dark:text-red-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-500 hover:shadow-lg dark:hover:shadow-red-700/20"
                                        >
                                            <X className="w-4 h-4" />
                                            Remove File
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3">
                                        <CloudArrowUpIcon className="w-12 h-12 text-light-muted-text dark:text-dark-muted-text" />
                                        <div>
                                            <p className="font-medium text-light-text dark:text-dark-text">
                                                Drop your file here or click to
                                                browse
                                            </p>
                                            <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                                Supports Excel (.xlsx, .xls) and
                                                CSV files up to 5MB
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Template Download */}
                        <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-light-text dark:text-dark-text">
                                        Need a template?
                                    </p>
                                    <p className="text-xs text-light-muted-text dark:text-dark-muted-text">
                                        Download a sample CSV file with the
                                        required format
                                    </p>
                                </div>
                                <Button
                                    onClick={downloadTemplate}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-lg hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
                                    title="Download reference file"
                                >
                                    <DocumentArrowDownIcon className="w-4 h-4" />
                                    Download Template
                                </Button>
                            </div>
                        </div>

                        {/* File Format Info */}
                        <div className="mb-6 text-sm text-light-muted-text dark:text-dark-muted-text">
                            <p className="font-medium mb-2">
                                Required columns:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                                <li>
                                    <strong>Name</strong> (required):
                                    Student&apos;s full name
                                </li>
                                <li>
                                    <strong>Email</strong> (required): Valid
                                    email address
                                </li>
                                <li>
                                    <strong>Enrollment</strong> (optional):
                                    Student enrollment number
                                </li>
                                <li>
                                    <strong>Batch</strong> (optional): Student
                                    batch/group
                                </li>
                                <li>
                                    <strong>Phone</strong> (optional): Phone
                                    number
                                </li>
                                <li>
                                    <strong>Department</strong> (optional):
                                    Department name
                                </li>
                                <li>
                                    <strong>Semester</strong> (optional):
                                    Semester information
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleClose}
                                disabled={isUploading}
                                className="bg-transparent border-2 border-primary-main text-light-highlight dark:text-dark-highlight py-2.5 px-4 rounded-xl
                            hover:bg-primary-lighter focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                            transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={!file || isUploading}
                                className="flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                                                                        hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                                                                        transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader size="sm" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <CloudArrowUpIcon className="w-4 h-4" />
                                        Upload Students
                                    </>
                                )}
                            </button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

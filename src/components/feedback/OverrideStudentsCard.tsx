// src/components/feedback/OverrideStudentsCard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
    CloudArrowUpIcon,
    TrashIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { showToast } from "@/lib/toast";
import { OverrideStudentUploadResult as UploadOverrideStudentsResponse } from "@/interfaces/overrideStudent";

import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/common/Loader";
import OverrideStudentsModal from "@/components/modals/OverrideStudentsModal";
import { OverrideStudentsList } from "./OverrideStudentsList";
import overrideStudentsService from "@/services/overrideStudentsService";

interface OverrideStudentsCardProps {
    formId: string;
    formStatus: string;
    formTitle?: string; // Add optional formTitle prop
}

export default function OverrideStudentsCard({
    formId,
    formStatus,
    formTitle = "Feedback Form", // Default title if not provided
}: OverrideStudentsCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studentCount, setStudentCount] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClearing, setIsClearing] = useState(false);
    const [showStudentsList, setShowStudentsList] = useState(true);
    const [awaitingSecondConfirmation, setAwaitingSecondConfirmation] =
        useState(false);

    const fetchStudentCount = useCallback(async () => {
        try {
            setIsLoading(true);
            const count =
                await overrideStudentsService.getOverrideStudentsCount(formId);
            setStudentCount(count);
            setShowStudentsList(count > 0);
        } catch (error) {
            showToast.error("Failed to fetch students count: " + error);
            setStudentCount(0);
            // setShowStudentsList(false);
        } finally {
            setIsLoading(false);
        }
    }, [formId]);

    useEffect(() => {
        fetchStudentCount();
    }, [formId, fetchStudentCount]);

    const handleUploadSuccess = (result: UploadOverrideStudentsResponse) => {
        showToast.success(
            `Successfully uploaded ${result.rowsAffected} students${
                result.skippedRows > 0
                    ? `, skipped ${result.skippedRows} rows`
                    : ""
            }`
        );
        fetchStudentCount(); // Refresh count
        setShowStudentsList(true);
    };

    const handleClearStudents = async () => {
        if (!awaitingSecondConfirmation) {
            // First click: ask for confirmation
            setAwaitingSecondConfirmation(true);
            // Optionally, set a timeout to reset this state if no second click occurs
            setTimeout(() => {
                setAwaitingSecondConfirmation(false);
            }, 5000); // Reset after 3 seconds if not confirmed
            return;
        }

        // Second click: proceed with deletion
        setIsClearing(true);
        setAwaitingSecondConfirmation(false); // Reset immediately as we are proceeding
        try {
            const deletedCount =
                await overrideStudentsService.clearAllOverrideStudents(formId);
            showToast.success(`Cleared ${deletedCount} students`);
            setStudentCount(0);
            setShowStudentsList(false); // Hide students list when cleared
        } catch (error) {
            showToast.error("Failed to clear students: " + error);
        } finally {
            setIsClearing(false);
        }
    };

    const canModifyStudents = formStatus === "DRAFT";

    return (
        <div>
            <Card className="p-6 bg-light-background dark:bg-dark-muted-background">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                        {/* <UserGroupIcon className="w-6 h-6 text-light-text dark:text-dark-text" /> */}
                        <h3 className="text-2xl font-semibold text-light-text dark:text-dark-text">
                            Students
                            {/* {" "} */}
                            {/* {studentCount! > 0 && <span>({studentCount})</span>} */}
                        </h3>
                    </div>
                    {isLoading && <Loader size="sm" />}
                    <div className="flex justify-between items-start">
                        <div className="flex flex-row gap-2">
                            {studentCount! > 0 && canModifyStudents && (
                                <button
                                    onClick={handleClearStudents} // Use the new handler
                                    className={`flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2
                                                ${
                                                    awaitingSecondConfirmation
                                                        ? "border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                                        : "border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                                }`}
                                    disabled={isClearing}
                                >
                                    {isClearing ? (
                                        <Loader size="sm" />
                                    ) : (
                                        <TrashIcon className="w-6 h-6" />
                                    )}
                                    {isClearing
                                        ? "Deleting..."
                                        : awaitingSecondConfirmation
                                        ? "Are you sure?"
                                        : "Delete All Students"}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                disabled={!canModifyStudents}
                                // size="sm"
                                className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                                                                        hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                                                                        transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CloudArrowUpIcon className="w-6 h-6" />
                                {studentCount && studentCount > 0
                                    ? "Update Student Data"
                                    : "Upload Student Data"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {!canModifyStudents && (
                        <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                            <p className="text-md text-yellow-800 dark:text-yellow-300">
                                <ExclamationTriangleIcon className="w-6 h-6 inline mr-1" />
                                Students can only be modified when the form is
                                in DRAFT status.
                            </p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Students List - Same as main page */}
            <OverrideStudentsList
                formTitle={formTitle}
                formId={formId}
                isExpanded={showStudentsList}
                pageSize={10}
            />

            {/* Override Students Modal */}
            <OverrideStudentsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formId={formId}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
}

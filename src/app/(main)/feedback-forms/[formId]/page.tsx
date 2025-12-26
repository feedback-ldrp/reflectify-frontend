// src/app/(main)/feedback-forms/[formId]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { showToast } from "@/lib/toast";

// Import components
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/common/Loader"; // Assuming this is a spinner component
import { PageLoader } from "@/components/ui/LoadingSpinner"; // Assuming this is a full-page loader

// Import services
import feedbackFormService from "@/services/feedbackFormService";

// Import interfaces
import { FeedbackForm } from "@/interfaces/feedbackForm";

interface FeedbackFormDetailsPageProps {
    params: { formId: string };
}

export default function FeedbackFormDetailsPage({
    params,
}: FeedbackFormDetailsPageProps) {
    const router = useRouter();
    const { formId } = params;
    const [form, setForm] = useState<FeedbackForm | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    // State for dual confirmation delete on the button itself
    const [pendingDelete, setPendingDelete] = useState(false);
    const [deleteTimeout, setDeleteTimeout] = useState<NodeJS.Timeout | null>(
        null
    );

    const fetchForm = useCallback(async () => {
        try {
            const formData = await feedbackFormService.getFormById(formId);
            setForm(formData);
        } catch (error) {
            showToast.error("Failed to load feedback form: " + error);
            router.push("/feedback-forms");
        } finally {
            setLoading(false);
        }
    }, [formId, router]);

    useEffect(() => {
        fetchForm();
    }, [fetchForm]);

    const handleDeleteForm = useCallback(async () => {
        if (pendingDelete) {
            // Second click: proceed with deletion
            setPendingDelete(false); // Reset pending state
            if (deleteTimeout) {
                clearTimeout(deleteTimeout);
                setDeleteTimeout(null);
            }
            setDeleting(true); // Show loading spinner
            try {
                await feedbackFormService.softDeleteForm(formId);
                showToast.success("Feedback form deleted successfully");
                router.push("/feedback-forms");
            } catch (error) {
                showToast.error("Failed to delete feedback form: " + error);
            } finally {
                setDeleting(false);
            }
        } else {
            // First click: ask for confirmation
            setPendingDelete(true);
            const timeout = setTimeout(() => {
                setPendingDelete(false); // Reset after 5 seconds if no second click
                setDeleteTimeout(null);
            }, 5000); // 5 seconds to confirm
            setDeleteTimeout(timeout);
            showToast.info("Click again to confirm deletion."); // Inform user
        }
    }, [pendingDelete, deleteTimeout, formId, router]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "text-green-600 bg-green-50 border-green-200 dark:bg-green-600/30 dark:border-green-600 dark:text-green-200";
            case "draft":
                return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-600/30 dark:border-yellow-600 dark:text-yellow-200";
            case "closed":
                return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-600/30 dark:border-blue-600 dark:text-blue-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-600/30 dark:border-gray-600 dark:text-gray-200";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return <PageLoader text="Loading Feedback Form" />;
    }

    if (!form) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light-muted-background dark:bg-dark-background">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-light-text dark:text-dark-text">
                        Feedback Form Not Found
                    </h1>
                    <p className="text-light-muted-text dark:text-dark-muted-text mt-2">
                        The requested feedback form could not be found.
                    </p>
                    <Button
                        onClick={() => router.push("/feedback-forms")}
                        className="mt-4"
                    >
                        Back to Feedback Forms
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-muted-background dark:bg-dark-background">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 md:py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                aria-label="Go Back"
                                onClick={() => router.back()}
                                className="p-2 text-light-text dark:text-dark-text"
                            >
                                <ArrowLeftIcon className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-semibold text-light-text dark:text-dark-text">
                                    {form.title} - Preview
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDeleteForm}
                                disabled={deleting}
                                className="flex py-2 px-3 items-center border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 bg-transparent border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                            >
                                {deleting ? (
                                    <Loader />
                                ) : (
                                    <TrashIcon className="h-6 w-6" />
                                )}
                                {deleting
                                    ? "Deleting..."
                                    : pendingDelete
                                    ? "Confirm Delete"
                                    : "Delete"}
                            </button>
                            <button
                                onClick={() =>
                                    router.push(
                                        `/feedback-forms/edit/${form.id}`
                                    )
                                }
                                className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                             hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                             transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PencilIcon className="h-6 w-6" />
                                Edit
                            </button>
                        </div>
                    </div>
                    <Card className="p-6 bg-light-background dark:bg-dark-muted-background space-y-6">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center justify-center">
                                <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text flex items-center justify-center gap-3">
                                    Form Details{" "}
                                    <span
                                        className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(
                                            form.status
                                        )}`}
                                    >
                                        {form.status}
                                    </span>
                                </h2>
                            </div>
                        </div>
                        <div className="w-full grid grid-cols-3 items-center gap-4">
                            <div className="flex gap-3 flex-col">
                                <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                    Title:{" "}
                                    <span className="text-light-text dark:text-dark-text font-semibold">
                                        {form.title}
                                    </span>
                                </p>
                                {form.division?.department && (
                                    <div>
                                        <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                            Department:{" "}
                                            <span className="text-light-text dark:text-dark-text font-semibold">
                                                {form.division.department.name}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 flex-col items-center">
                                {form.title && (
                                    <div>
                                        <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                            Semester:{" "}
                                            <span className="text-light-text dark:text-dark-text font-semibold">
                                                {/* Extract from title - title has only 1 number which is the semester number */}
                                                {form.title.match(/(\d+)/)?.[0]}
                                            </span>
                                        </p>
                                    </div>
                                )}
                                {form.division && (
                                    <div>
                                        <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                            Division:{" "}
                                            <span className="text-light-text dark:text-dark-text font-semibold">
                                                {form.division.divisionName}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                            {form.startDate && form.endDate && (
                                <div className="flex gap-3 flex-col items-end">
                                    <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                        Start Date:{" "}
                                        <span className="text-light-text dark:text-dark-text font-semibold">
                                            {formatDate(form.startDate)}
                                        </span>
                                    </p>
                                    <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                        End Date:{" "}
                                        <span className="text-light-text dark:text-dark-text font-semibold">
                                            {formatDate(form.endDate)}
                                        </span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Form Details */}
                    <div className="flex items-center justify-center w-full">
                        {/* Main Details */}
                        <div className="w-full">
                            {/* Questions Preview */}
                            <Card className="p-6">
                                <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-4">
                                    Questions ({form.questions?.length || 0})
                                </h2>
                                {/* Group questions by batch */}
                                {form.questions &&
                                    form.questions.length > 0 &&
                                    (() => {
                                        // Group questions by batch
                                        const grouped: Record<
                                            string,
                                            typeof form.questions
                                        > = {};
                                        form.questions.forEach((q) => {
                                            const batchKey =
                                                !q.batch ||
                                                q.batch === "None" ||
                                                q.batch === "-"
                                                    ? "Lecture"
                                                    : q.batch;
                                            if (!grouped[batchKey])
                                                grouped[batchKey] = [];
                                            grouped[batchKey].push(q);
                                        });

                                        // Sort batch keys: Lecture first, then batches in order
                                        const batchKeys = Object.keys(
                                            grouped
                                        ).sort((a, b) => {
                                            if (a === "Lecture") return -1;
                                            if (b === "Lecture") return 1;
                                            // Sort batches numerically, handling possible "*"
                                            const parseBatch = (
                                                batch: string
                                            ) => {
                                                const match =
                                                    batch.match(/^(\d+)/);
                                                return match
                                                    ? parseInt(match[1], 10)
                                                    : 999;
                                            };
                                            return (
                                                parseBatch(a) - parseBatch(b)
                                            );
                                        });

                                        return (
                                            <div className="space-y-6">
                                                {batchKeys.map((batchKey) => (
                                                    <div key={batchKey}>
                                                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                                                            {batchKey ===
                                                            "Lecture"
                                                                ? "Lecture Questions"
                                                                : `Batch ${batchKey} Questions`}
                                                        </h3>
                                                        <div className="space-y-3">
                                                            {grouped[
                                                                batchKey
                                                            ].map(
                                                                (
                                                                    question,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            question.id
                                                                        }
                                                                        className="p-3 bg-light-muted-background dark:bg-dark-muted-background rounded-lg"
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div>
                                                                                <p className="font-medium text-light-text dark:text-dark-text">
                                                                                    {index +
                                                                                        1}

                                                                                    .{" "}
                                                                                    {
                                                                                        question.text
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

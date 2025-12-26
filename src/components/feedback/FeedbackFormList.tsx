// src/components/feedback/FeedbackFormList.tsx
"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { FeedbackForm } from "@/interfaces/feedbackForm";
import { FeedbackFormListItem } from "@/components/feedback/FeedbackFormListItem";
import { Pagination } from "@/components/ui/Pagination";

interface FeedbackFormListProps {
    forms: FeedbackForm[];
    totalForms: number;
    onView: (formId: string) => void;
    onEdit: (formId: string) => void;
    onDelete: (formId: string) => void;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    pendingDeleteId: string | null;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export const FeedbackFormList = ({
    forms,
    totalForms,
    onView,
    onEdit,
    onDelete,
    currentPage,
    totalPages,
    itemsPerPage,
    onPageChange,
    pendingDeleteId,
}: FeedbackFormListProps) => {
    // Calculate the range of items being displayed
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(startItem + forms.length - 1, totalForms);

    return (
        <motion.div
            variants={itemVariants}
            className="bg-light-background dark:bg-dark-muted-background rounded-xl shadow-sm border border-light-secondary dark:border-dark-secondary overflow-hidden"
        >
            <div className="p-4 border-b border-light-secondary dark:border-dark-secondary">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">
                        Feedback Forms
                    </h2>
                    <div className="text-sm text-light-muted-text dark:text-dark-muted-text">
                        {totalForms === 0 ? (
                            "No forms"
                        ) : (
                            <>
                                Showing {startItem}-{endItem} of {totalForms}{" "}
                                forms
                            </>
                        )}
                    </div>
                </div>
            </div>

            {forms.length === 0 ? (
                <div className="p-8 text-center">
                    <FileText className="w-12 h-16 mx-auto text-light-muted-text dark:text-dark-muted-text mb-4" />
                    <p className="text-light-muted-text dark:text-dark-muted-text">
                        {totalForms === 0
                            ? "No feedback forms found. Create your first form to get started."
                            : "No forms match your current filters."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="divide-y divide-light-secondary dark:divide-dark-secondary">
                        {forms.map((form, index) => (
                            <FeedbackFormListItem
                                key={form.id}
                                form={form}
                                index={index}
                                onView={onView}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                isPendingDelete={
                                    pendingDeleteId === form.id.toString()
                                }
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t border-light-secondary dark:border-dark-secondary">
                            <div className="flex justify-center">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={totalForms}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={onPageChange}
                                    size="md"
                                    maxVisiblePages={5}
                                    showInfo={false}
                                    className="w-full max-w-md text-light-text dark:text-dark-text"
                                />
                            </div>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

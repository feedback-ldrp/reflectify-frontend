"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { showToast } from "@/lib/toast";
import { Badge } from "@/components/ui/Badge";
import { OverrideStudent } from "@/interfaces/overrideStudent";
import overrideStudentsService from "@/services/overrideStudentsService";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable"; // Import DataTable and DataTableColumn

interface OverrideStudentsListProps {
    formTitle: string;
    formId: string;
    isExpanded: boolean;
    pageSize?: number;
}

export const OverrideStudentsList = ({
    formTitle,
    formId,
    isExpanded,
    pageSize = 5,
}: OverrideStudentsListProps) => {
    const [students, setStudents] = useState<OverrideStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isExpanded) return;

        const fetchStudents = async () => {
            setLoading(true);
            try {
                const data =
                    await overrideStudentsService.getAllOverrideStudents(
                        formId
                    );
                setStudents(data);
                setError(null);
            } catch (err: any) {
                showToast.error("Failed to fetch override students: " + err);
                setError(err.message || "Failed to fetch override students");
                showToast.error("Failed to load override students");
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [formId, isExpanded]);

    // Define columns for the DataTable
    const columns: DataTableColumn<OverrideStudent>[] = useMemo(
        () => [
            {
                key: "name",
                header: "Name",
                sortable: true,
                accessor: (student) => student.name,
            },
            {
                key: "email",
                header: "Email",
                sortable: true,
                accessor: (student) => student.email,
            },
            {
                key: "enrollmentNumber",
                header: "Enrollment",
                sortable: true,
                accessor: (student) => student.enrollmentNumber || "-",
            },
            {
                key: "department",
                header: "Department",
                sortable: true,
                accessor: (student) => student.department || "-",
            },
            {
                key: "semester",
                header: "Semester",
                sortable: true,
                accessor: (student) => student.semester || "-",
            },
            {
                key: "batch",
                header: "Batch",
                sortable: true,
                accessor: (student) => student.batch || "-",
            },
        ],
        []
    );

    if (!isExpanded) return null;

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-light-background dark:bg-dark-muted-background rounded-md"
            >
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-light-highlight dark:text-dark-highlight" />
                    <span className="ml-2 text-light-text dark:text-dark-text">
                        Loading students...
                    </span>
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-light-background dark:bg-dark-muted-background rounded-md"
            >
                <div className="flex items-center justify-center py-4 text-red-500">
                    <AlertCircle className="w-6 h-6" />
                    <span className="ml-2">{error}</span>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-light-background dark:bg-dark-muted-background rounded-lg"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="text-lg font-semibold text-light-text dark:text-dark-text flex items-center">
                    <Users className="mr-2 w-5 h-5" />
                    Students List - {formTitle.split(" - ")[0]} Feedback Form
                </div>
                <div className="flex items-center">
                    <Badge variant="secondary" className="ml-2 text-sm">
                        {students.length}{" "}
                        {students.length === 1 ? "Student" : "Students"}
                    </Badge>
                    <Badge
                        variant="secondary"
                        className="ml-2 text-sm cursor-pointer"
                        onClick={() => {
                            window.location.href = `/feedback-forms/edit/${formId}`;
                        }}
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                        View All Students
                    </Badge>
                </div>
            </div>

            {students.length === 0 ? (
                <div className="text-center py-8 text-light-muted-text dark:text-dark-muted-text rounded-lg">
                    <Users className="w-12 h-12 mx-auto opacity-40 mb-2" />
                    <p>No students have been added to this form yet.</p>
                    <p className="text-md">
                        Add students from the form{" "}
                        <button
                            className="text-light-highlight dark:text-dark-highlight"
                            onClick={() => {
                                window.location.href = `/feedback-forms/edit/${formId}`;
                            }}
                        >
                            edit
                        </button>{" "}
                        page.
                    </p>
                </div>
            ) : (
                <DataTable
                    data={students}
                    columns={columns}
                    pageSize={pageSize} // You can adjust the page size as needed
                    showPagination={true}
                    showSearch={true} // Set to true if you want the search bar
                    emptyMessage="No matching students found."
                    className="bg-light-background dark:bg-dark-muted-background rounded-lg border border-light-muted-background shadow-md"
                />
            )}
        </motion.div>
    );
};

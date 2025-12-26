// src/app/(main)/feedback-forms/page.tsx
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { showToast } from "@/lib/toast";

// Import hooks and services
import { useAllFeedbackForms } from "@/hooks/useFeedbackForms";
import { useRouter } from "next/navigation";
import feedbackFormService from "@/services/feedbackFormService";

// Import UI components
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/LoadingSpinner";

// Import modular components
import {
    FeedbackFormHeader,
    FeedbackFormStats,
    FeedbackFormSearchFilter,
    FeedbackFormList,
} from "@/components/feedback";

// Import interfaces
import { FeedbackFormStatus } from "@/interfaces/feedbackForm";

export default function FeedbackFormManagement() {
    const router = useRouter();

    // State for search and filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        FeedbackFormStatus | "ALL"
    >("ALL");
    const [academicYearFilter, setAcademicYearFilter] = useState("ALL");
    const [departmentFilter, setDepartmentFilter] = useState("ALL");
    const [divisionFilter, setDivisionFilter] = useState("ALL");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Fixed items per page

    // Fetch feedback forms using the existing hook
    const {
        data: feedbackForms = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useAllFeedbackForms();

    // Filter and search logic
    const filteredForms = useCallback(() => {
        const filtered = feedbackForms.filter((form) => {
            const matchesSearch =
                form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                form.division?.divisionName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                form.division?.department?.name
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                form.division?.semester?.academicYear?.yearString
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" || form.status === statusFilter;

            const matchesAcademicYear =
                academicYearFilter === "ALL" ||
                form.division?.semester?.academicYear?.yearString ===
                    academicYearFilter;

            const matchesDepartment =
                departmentFilter === "ALL" ||
                form.division?.department?.name === departmentFilter;

            const matchesDivision =
                divisionFilter === "ALL" ||
                form.division?.divisionName === divisionFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesAcademicYear &&
                matchesDepartment &&
                matchesDivision
            );
        });

        // Apply sorting
        filtered.sort((a, b) => {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();

            if (sortOrder === "asc") {
                return titleA.localeCompare(titleB);
            } else {
                return titleB.localeCompare(titleA);
            }
        });

        return filtered;
    }, [
        feedbackForms,
        searchTerm,
        statusFilter,
        academicYearFilter,
        departmentFilter,
        divisionFilter,
        sortOrder,
    ]);

    // Calculate pagination
    const totalFilteredForms = filteredForms().length;
    const totalPages = Math.ceil(totalFilteredForms / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedForms = filteredForms().slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // Scroll to top when changing pages
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Reset to first page when filters change
    const resetToFirstPage = useCallback(() => {
        setCurrentPage(1);
    }, []);

    // Handle actions
    const handleView = useCallback(
        (formId: string) => {
            router.push(`/feedback-forms/${formId}`);
        },
        [router]
    );

    const handleEdit = useCallback(
        (formId: string) => {
            router.push(`/feedback-forms/edit/${formId}`);
        },
        [router]
    );

    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleteTimeout, setDeleteTimeout] = useState<NodeJS.Timeout | null>(
        null
    );

    const handleDelete = useCallback(
        async (formId: string) => {
            if (pendingDeleteId === formId) {
                setPendingDeleteId(null);
                if (deleteTimeout) {
                    clearTimeout(deleteTimeout);
                    setDeleteTimeout(null);
                }
                try {
                    await feedbackFormService.softDeleteForm(formId);
                    refetch();
                    showToast.success("Feedback form deleted successfully");
                } catch (error) {
                    showToast.error("Failed to delete feedback form: " + error);
                }
            } else {
                // First click, ask for confirmation
                setPendingDeleteId(formId);
                const timeout = setTimeout(() => {
                    setPendingDeleteId(null);
                }, 5000);
                setDeleteTimeout(timeout);
            }
        },
        [pendingDeleteId, deleteTimeout, refetch]
    );

    const handleCreateNew = useCallback(() => {
        router.push("/feedback-forms/create");
    }, [router]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetch();
        } finally {
            setIsRefreshing(false);
            showToast.success("Forms data refreshed!");
        }
    }, [refetch]);

    // Handle stat click to filter by status
    const handleStatClick = useCallback(
        (status: FeedbackFormStatus) => {
            setStatusFilter(status);
            // Reset hierarchical filters when changing status filter
            setAcademicYearFilter("ALL");
            setDepartmentFilter("ALL");
            setDivisionFilter("ALL");
            setSortOrder("asc");
            resetToFirstPage();
        },
        [resetToFirstPage]
    );

    // Enhanced filter handlers that reset pagination
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value);
            resetToFirstPage();
        },
        [resetToFirstPage]
    );

    const handleStatusFilterChange = useCallback(
        (status: FeedbackFormStatus | "ALL") => {
            setStatusFilter(status);
            resetToFirstPage();
        },
        [resetToFirstPage]
    );

    const handleAcademicYearFilterChange = useCallback(
        (year: string) => {
            setAcademicYearFilter(year);
            resetToFirstPage();
        },
        [resetToFirstPage]
    );

    const handleDepartmentFilterChange = useCallback(
        (department: string) => {
            setDepartmentFilter(department);
            resetToFirstPage();
        },
        [resetToFirstPage]
    );

    const handleDivisionFilterChange = useCallback(
        (division: string) => {
            setDivisionFilter(division);
            resetToFirstPage();
        },
        [resetToFirstPage]
    );

    const handleSortOrderChange = useCallback(
        (order: "asc" | "desc") => {
            setSortOrder(order);
            resetToFirstPage();
        },
        [resetToFirstPage]
    );

    // Loading state
    if (isLoading) {
        return <PageLoader text="Loading Forms" />;
    }

    // Error state
    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light-muted-background dark:bg-dark-background">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                    <p className="text-light-text dark:text-dark-text mb-2">
                        {error?.message || "Failed to load feedback forms."}
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                        >
                            Reload Page
                        </Button>
                        <Button onClick={handleRefresh} variant="default">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-muted-background dark:bg-dark-background">
            <div className="max-w-[1920px] mx-auto px-6 py-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {/* Header Section */}
                    <FeedbackFormHeader
                        isRefreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        onCreateNew={handleCreateNew}
                    />

                    {/* Stats Cards */}
                    <FeedbackFormStats
                        forms={feedbackForms}
                        onStatClick={handleStatClick}
                    />

                    {/* Search and Filter Section */}
                    <FeedbackFormSearchFilter
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        academicYearFilter={academicYearFilter}
                        departmentFilter={departmentFilter}
                        divisionFilter={divisionFilter}
                        sortOrder={sortOrder}
                        forms={feedbackForms}
                        onSearchChange={handleSearchChange}
                        onStatusFilterChange={handleStatusFilterChange}
                        onAcademicYearFilterChange={
                            handleAcademicYearFilterChange
                        }
                        onDepartmentFilterChange={handleDepartmentFilterChange}
                        onDivisionFilterChange={handleDivisionFilterChange}
                        onSortOrderChange={handleSortOrderChange}
                    />

                    {/* Forms List */}
                    <FeedbackFormList
                        forms={paginatedForms}
                        totalForms={totalFilteredForms}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        pendingDeleteId={pendingDeleteId}
                    />
                </motion.div>
            </div>
        </div>
    );
}

// src/app/academic-years/page.tsx
"use client";

import React, { useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { showToast } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/ui/StatCard";
import {
    useAllAcademicYears,
    useCreateAcademicYear,
    useUpdateAcademicYear,
    useSoftDeleteAcademicYear,
    useAcademicYearStats,
} from "@/hooks/useAcademicYears"; // Importing from the provided hook file
import {
    CalendarDays, // Using CalendarDays for academic year icon
    RefreshCw,
    Plus,
    X,
    Search,
    Edit,
    Trash2,
    Loader,
    CheckIcon,
    CalendarCheckIcon,
    BookCheckIcon,
} from "lucide-react"; // ChevronDownIcon removed as Select is not used for AcademicYear
import {
    ClipboardDocumentListIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import {
    AcademicYear,
    CreateAcademicYearData,
    UpdateAcademicYearData,
} from "@/interfaces/academicYear";
import { IdType } from "@/interfaces/common";
import { PageLoader } from "@/components/ui/LoadingSpinner";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function AcademicYearManagement() {
    const router = useRouter();

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Card visibility states
    const [showAddAcademicYearCard, _setShowAddAcademicYearCard] =
        useState(false);
    const [editingAcademicYear, _setEditingAcademicYear] =
        useState<AcademicYear | null>(null);
    const [deletingAcademicYear, _setDeletingAcademicYear] =
        useState<AcademicYear | null>(null);

    // Helper function to manage card visibility and scroll
    const setShowAddAcademicYearCard = useCallback((show: boolean) => {
        _setShowAddAcademicYearCard(show);
        if (show) {
            _setEditingAcademicYear(null);
            _setDeletingAcademicYear(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const setEditingAcademicYear = useCallback((year: AcademicYear | null) => {
        _setEditingAcademicYear(year);
        if (year) {
            _setShowAddAcademicYearCard(false);
            _setDeletingAcademicYear(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const setDeletingAcademicYear = useCallback((year: AcademicYear | null) => {
        _setDeletingAcademicYear(year);
        if (year) {
            _setShowAddAcademicYearCard(false);
            _setEditingAcademicYear(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    // Use the custom data hooks
    const {
        data: academicYears = [],
        isLoading,
        isError,
        error,
        refetch: refetchAcademicYears,
    } = useAllAcademicYears();
    const { stats: academicYearStats, isLoading: isLoadingStats } =
        useAcademicYearStats();

    // Initialize mutation hooks
    const createAcademicYearMutation = useCreateAcademicYear();
    const updateAcademicYearMutation = useUpdateAcademicYear();
    const softDeleteAcademicYearMutation = useSoftDeleteAcademicYear();

    // Sync local state with hook state (for search and sort)
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleSortOrderChange = useCallback((value: "asc" | "desc") => {
        setSortOrder(value);
    }, []);

    // New academic year form state (for Add Academic Year Card)
    const [newAcademicYear, setNewAcademicYear] =
        useState<CreateAcademicYearData>({
            yearString: `${new Date().getFullYear()}-${
                new Date().getFullYear() + 1
            }`, // Default to current year string
            isActive: false,
        });

    // State for editing academic year (for Edit Academic Year Card)
    const [currentEditAcademicYear, setCurrentEditAcademicYear] = useState<
        (UpdateAcademicYearData & { id: IdType }) | null
    >(null);

    // Filter and sort data locally
    const filteredAndSortedAcademicYears = useMemo(() => {
        let filtered = [...academicYears];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter((year) =>
                year.yearString.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = a.yearString;
            const bValue = b.yearString;

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [academicYears, searchTerm, sortOrder]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearchTerm("");
        setSortOrder("desc");
    }, []);

    // Check if any filters are active
    const hasActiveFilters = searchTerm !== "" || sortOrder !== "desc";

    const handleAddAcademicYear = useCallback(async () => {
        if (!newAcademicYear.yearString.trim()) {
            showToast.error("Please fill in the Academic Year string.");
            return;
        }

        const academicYearData: CreateAcademicYearData = {
            yearString: newAcademicYear.yearString,
            isActive: newAcademicYear.isActive,
        };

        try {
            await createAcademicYearMutation.mutateAsync(academicYearData);
            setShowAddAcademicYearCard(false);
            setNewAcademicYear({
                yearString: `${new Date().getFullYear()}-${
                    new Date().getFullYear() + 1
                }`,
                isActive: false,
            });
        } catch (err: any) {
            showToast.error(err.message || "Failed to create academic year");
        }
    }, [
        newAcademicYear,
        createAcademicYearMutation,
        setShowAddAcademicYearCard,
    ]);

    const handleUpdateAcademicYear = useCallback(async () => {
        if (!currentEditAcademicYear || !currentEditAcademicYear.id) {
            showToast.error("No academic year selected for update.");
            return;
        }

        // Basic validation for required fields in the update form
        if (!currentEditAcademicYear.yearString?.trim()) {
            showToast.error(
                "Please fill in the Academic Year string for update."
            );
            return;
        }

        try {
            await updateAcademicYearMutation.mutateAsync({
                id: currentEditAcademicYear.id,
                data: {
                    yearString: currentEditAcademicYear.yearString,
                    isActive: currentEditAcademicYear.isActive,
                },
            });
            setEditingAcademicYear(null); // Close the edit card
            setCurrentEditAcademicYear(null); // Clear current edit state
        } catch (err: any) {
            showToast.error(err.message || "Failed to update academic year");
        }
    }, [
        currentEditAcademicYear,
        updateAcademicYearMutation,
        setEditingAcademicYear,
    ]);

    const confirmDeleteAcademicYear = useCallback(async () => {
        if (!deletingAcademicYear) {
            showToast.error("No academic year selected for deletion.");
            return;
        }
        try {
            await softDeleteAcademicYearMutation.mutateAsync(
                deletingAcademicYear.id
            );
            setDeletingAcademicYear(null); // Close the delete card
        } catch (err: any) {
            showToast.error("Failed to delete academic year: " + err.message);
        }
    }, [
        deletingAcademicYear,
        softDeleteAcademicYearMutation,
        setDeletingAcademicYear,
    ]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetchAcademicYears();
            showToast.success("Academic year data refreshed!");
        } catch (err: any) {
            showToast.error("Refresh failed: " + err);
            showToast.error(
                err.message || "Failed to refresh academic year data."
            );
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchAcademicYears]);

    // Define DataTable columns
    const columns: DataTableColumn<AcademicYear>[] = useMemo(
        () => [
            {
                key: "yearString",
                header: "Academic Year",
                sortable: true,
                accessor: (year) => (
                    <span className="font-medium text-light-text dark:text-dark-text">
                        {year.yearString}
                    </span>
                ),
            },
            {
                key: "isActive",
                header: "Active",
                sortable: true,
                accessor: (year) => (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            year.isActive
                                ? "bg-positive-main/20 text-positive-main"
                                : "bg-negative-main/20 text-negative-main"
                        }`}
                    >
                        {year.isActive ? "Yes" : "No"}
                    </span>
                ),
            },
            {
                key: "semesters",
                header: "Semesters",
                sortable: true,
                accessor: (year) => (
                    <>
                        {year._count && year._count.semesters ? (
                            <span className="font-medium text-light-text dark:text-dark-text">
                                {year._count.semesters}
                            </span>
                        ) : (
                            <span className="font-medium text-light-text dark:text-dark-text">
                                0
                            </span>
                        )}
                    </>
                ),
            },
            {
                key: "subjectAllocations",
                header: "Subject Allocations",
                sortable: true,
                accessor: (year) => (
                    <>
                        {year._count && year._count.subjectAllocations ? (
                            <span className="font-medium text-light-text dark:text-dark-text">
                                {year._count.subjectAllocations}
                            </span>
                        ) : (
                            <span className="font-medium text-light-text dark:text-dark-text">
                                0
                            </span>
                        )}
                    </>
                ),
            },
            {
                key: "actions",
                header: "Actions",
                accessor: (year) => (
                    <div className="flex items-center justify-start gap-2">
                        <button
                            onClick={() => {
                                setEditingAcademicYear(year);
                                setCurrentEditAcademicYear({
                                    id: year.id,
                                    yearString: year.yearString,
                                    isActive: year.isActive,
                                });
                            }}
                            className="flex text-sm py-1 px-3 items-center gap-1 bg-transparent border rounded-xl border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-secondary dark:hover:bg-dark-secondary"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>

                        <button
                            onClick={() => setDeletingAcademicYear(year)}
                            className="flex text-sm py-1 px-3 items-center gap-1 bg-transparent border rounded-xl border-red-600
                               text-red-600 dark:text-red-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-500 hover:bg-negative-main/10 dark:hover:bg-negative-dark/10"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                ),
            },
        ],
        [setEditingAcademicYear, setDeletingAcademicYear]
    );

    if (isLoading || isLoadingStats) {
        return <PageLoader text="Loading Academic Years" />;
    }

    // Display error if data fetch failed and there's no data to show
    if (isError && academicYears.length === 0) {
        return (
            <div className="min-h-screen bg-light-muted-background dark:bg-dark-background flex items-center justify-center">
                <div className="text-center p-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                        Failed to load academic year data
                    </h3>
                    <p className="text-light-muted-text dark:text-dark-muted-text mb-6">
                        {error?.message ||
                            "We encountered an error while fetching academic year data. Please try again."}
                    </p>
                    <Button
                        onClick={handleRefresh}
                        className="bg-primary-main hover:bg-primary-dark text-white dark:bg-dark-highlight dark:hover:bg-dark-highlight/80"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </Button>
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
                    variants={containerVariants}
                    className="space-y-4"
                >
                    {/* Header */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-light-background dark:bg-dark-muted-background p-6 rounded-xl shadow-sm border border-light-secondary dark:border-dark-secondary"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            {/* Left Section: Title and Description */}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-light-text dark:text-dark-text flex items-center gap-3">
                                    Academic Year Management
                                </h1>
                                <p className="text-base text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2">
                                    <CalendarDays className="h-6 w-6 text-positive-main" />
                                    Manage academic years and their details
                                </p>
                            </div>

                            {/* Right Section: Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-1.5 py-2.5 px-4 text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-xl hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
                                    title="Refresh Academic Year Data"
                                >
                                    <RefreshCw
                                        className={`w-5 h-5 ${
                                            isRefreshing ? "animate-spin" : ""
                                        }`}
                                    />
                                    {isRefreshing
                                        ? "Refreshing ..."
                                        : "Refresh Data"}
                                </button>
                                <button
                                    onClick={() =>
                                        setShowAddAcademicYearCard(true)
                                    }
                                    className="flex-1 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                             hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                             transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Plus className="h-5 w-5 border-light-text dark:border-dark-text" />
                                        <span className="flex items-center justify-center gap-2">
                                            Add Academic Year
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-4 gap-4"
                    >
                        <StatCard
                            title="Total Years"
                            value={academicYearStats.totalAcademicYears}
                            icon={CalendarDays}
                            onClick={() => {}}
                        />
                        <StatCard
                            title="Total Semesters"
                            value={academicYearStats.totalSemesters}
                            icon={ClipboardDocumentListIcon}
                            onClick={() => {
                                router.push("/semesters");
                            }}
                        />
                        <StatCard
                            title="Total Subject Allocations"
                            value={academicYearStats.totalSubjectAllocations}
                            icon={BookCheckIcon}
                            onClick={() => {}}
                        />
                        <StatCard
                            title="Current Year"
                            value={
                                academicYearStats.currentYear?.yearString ||
                                "N/A"
                            }
                            icon={CalendarCheckIcon}
                            onClick={() => {}}
                        />
                    </motion.div>
                    {/* Filters */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-light-background dark:bg-dark-muted-background p-4 rounded-xl shadow-sm border border-light-secondary dark:border-dark-secondary"
                    >
                        <div className="flex flex-col md:flex-row gap- items-center gap-4">
                            <div className="flex-1 w-full">
                                <Input
                                    type="text"
                                    leftIcon={<Search className="w-5 h-5" />}
                                    placeholder="Search by academic year string..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-2 bg-light-muted-background dark:bg-dark-muted-background
                                        text-light-text dark:text-dark-text border border-light-secondary dark:border-dark-secondary
                                        rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                                />
                            </div>

                            {/* Filters Row */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 flex-wrap items-center">
                                {/* Sort Order Toggle Button */}
                                <button
                                    onClick={() =>
                                        handleSortOrderChange(
                                            sortOrder === "asc" ? "desc" : "asc"
                                        )
                                    }
                                    className="px-3 py-2 border border-light-secondary dark:border-dark-secondary bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text rounded-lg text-sm hover:bg-light-hover dark:hover:bg-dark-hover"
                                >
                                    {sortOrder === "asc"
                                        ? "Sort: Oldest First"
                                        : "Sort: Newest First"}
                                </button>

                                {/* Clear Filters Button */}
                                <button
                                    onClick={handleClearFilters}
                                    disabled={!hasActiveFilters}
                                    className="flex py-2 px-3 items-center gap-1 bg-transparent border rounded-xl border-red-600 text-sm
               text-red-600 dark:text-red-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-500 hover:shadow-lg dark:hover:shadow-red-700/20"
                                >
                                    <X className="w-4 h-4" />
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Academic Year Add Card */}
                    {showAddAcademicYearCard && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Add New Academic Year
                                </h3>
                                <div className="flex flex-col md:flex-row items-start justify-center gap-4 mb-4">
                                    <div className="flex-1 space-y-4 w-full">
                                        <Input
                                            label="Academic Year String (e.g., 2023-2024)"
                                            type="text"
                                            value={newAcademicYear.yearString}
                                            onChange={(e) =>
                                                setNewAcademicYear({
                                                    ...newAcademicYear,
                                                    yearString: e.target.value,
                                                })
                                            }
                                            placeholder="Enter academic year string"
                                            required
                                            className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />

                                        <div className="flex items-center gap-2 mt-4">
                                            <input
                                                type="checkbox"
                                                id="isActiveAdd"
                                                checked={
                                                    newAcademicYear.isActive
                                                }
                                                onChange={(e) =>
                                                    setNewAcademicYear({
                                                        ...newAcademicYear,
                                                        isActive:
                                                            e.target.checked,
                                                    })
                                                }
                                                className="h-4 w-4 text-primary-main border-gray-300 rounded focus:ring-primary-main"
                                            />
                                            <label
                                                htmlFor="isActiveAdd"
                                                className="text-sm font-medium text-light-text dark:text-dark-text"
                                            >
                                                Set as Active Year
                                            </label>
                                        </div>
                                    </div>
                                    {/* Removed DayPickers as startDate and endDate are no longer in interfaces */}
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setShowAddAcademicYearCard(false)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddAcademicYear}
                                        disabled={
                                            createAcademicYearMutation.isPending ||
                                            !newAcademicYear.yearString.trim()
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {createAcademicYearMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {createAcademicYearMutation.isPending
                                            ? "Adding..."
                                            : "Add Academic Year"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Academic Year Edit Card */}
                    {editingAcademicYear && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Edit Academic Year:{" "}
                                    {editingAcademicYear.yearString}
                                </h3>
                                <div className="flex flex-col md:flex-row items-start justify-center gap-4 mb-4">
                                    <div className="flex-1 space-y-4 w-full">
                                        <Input
                                            label="Academic Year String (e.g., 2023-2024)"
                                            type="text"
                                            value={
                                                currentEditAcademicYear?.yearString ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                setCurrentEditAcademicYear(
                                                    (prev) => ({
                                                        ...(prev as UpdateAcademicYearData & {
                                                            id: IdType;
                                                        }),
                                                        yearString:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                            placeholder="Enter academic year string"
                                            required
                                            className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        <div className="flex items-center gap-2 mt-4">
                                            <input
                                                type="checkbox"
                                                id="isActiveEdit"
                                                checked={
                                                    currentEditAcademicYear?.isActive ||
                                                    false
                                                }
                                                onChange={(e) =>
                                                    setCurrentEditAcademicYear(
                                                        (prev) => ({
                                                            ...(prev as UpdateAcademicYearData & {
                                                                id: IdType;
                                                            }),
                                                            isActive:
                                                                e.target
                                                                    .checked,
                                                        })
                                                    )
                                                }
                                                className="h-4 w-4 text-primary-main border-gray-300 rounded focus:ring-primary-main"
                                            />
                                            <label
                                                htmlFor="isActiveEdit"
                                                className="text-sm font-medium text-light-text dark:text-dark-text"
                                            >
                                                Set as Active Year
                                            </label>
                                        </div>
                                    </div>
                                    {/* Removed DayPickers as startDate and endDate are no longer in interfaces */}
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setEditingAcademicYear(null)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateAcademicYear}
                                        disabled={
                                            updateAcademicYearMutation.isPending ||
                                            !currentEditAcademicYear?.yearString?.trim()
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updateAcademicYearMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {updateAcademicYearMutation.isPending
                                            ? "Updating..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Academic Year Delete Card */}
                    {deletingAcademicYear && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Confirm Deletion
                                </h3>
                                <p className="text-light-text dark:text-dark-text mb-6">
                                    Are you sure you want to delete academic
                                    year{" "}
                                    <span className="font-semibold">
                                        {deletingAcademicYear.yearString}
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setDeletingAcademicYear(null)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text hover:shadow-lg dark:hover:shadow-gray-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteAcademicYear}
                                        disabled={
                                            softDeleteAcademicYearMutation.isPending
                                        }
                                        className="text-sm flex items-center gap-2 bg-red-600 dark:bg-red-500 text-white py-2.5 px-4 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {softDeleteAcademicYearMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <Trash2 className="h-5 w-5" />
                                        )}
                                        {softDeleteAcademicYearMutation.isPending
                                            ? "Deleting..."
                                            : "Confirm Delete"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Academic Year Data Table */}
                    <motion.div variants={itemVariants}>
                        <DataTable
                            data={filteredAndSortedAcademicYears}
                            columns={columns}
                            loading={isLoading}
                            emptyMessage="No academic years found"
                            pageSize={15}
                            showPagination={true}
                            showSearch={false} // We have our own search above
                            className="bg-light-background dark:bg-dark-muted-background"
                            showCard={true}
                            stickyHeader={true} // Ensure sticky header is applied
                            maxHeight="700px" // Example max height for scrollable table
                            showserial={true} // Enable serial numbers
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

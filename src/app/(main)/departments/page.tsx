// src/app/departments/page.tsx
"use client";

import { useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { showToast } from "@/lib/toast";
import { StatCard } from "@/components/ui/StatCard";
import {
    useAllDepartments,
    useCreateDepartment,
    useUpdateDepartment,
    useSoftDeleteDepartment,
} from "@/hooks/useDepartments"; // Importing from the provided hook file
import {
    RefreshCw,
    Plus,
    X,
    Search,
    Edit,
    Trash2,
    Loader,
    CheckIcon,
    BookIcon,
} from "lucide-react";
import {
    AcademicCapIcon,
    BuildingOfficeIcon,
    ClipboardDocumentListIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import {
    Department,
    CreateDepartmentData,
    UpdateDepartmentData,
} from "@/interfaces/department";
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

export default function DepartmentManagement() {
    const router = useRouter();

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Card visibility states
    const [showAddDepartmentCard, _setShowAddDepartmentCard] = useState(false);
    const [editingDepartment, _setEditingDepartment] =
        useState<Department | null>(null);
    const [deletingDepartment, _setDeletingDepartment] =
        useState<Department | null>(null);

    // Helper function to manage card visibility and scroll
    const setShowAddDepartmentCard = useCallback((show: boolean) => {
        _setShowAddDepartmentCard(show);
        if (show) {
            _setEditingDepartment(null);
            _setDeletingDepartment(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const setEditingDepartment = useCallback(
        (department: Department | null) => {
            _setEditingDepartment(department);
            if (department) {
                _setShowAddDepartmentCard(false);
                _setDeletingDepartment(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        },
        []
    );

    const setDeletingDepartment = useCallback(
        (department: Department | null) => {
            _setDeletingDepartment(department);
            if (department) {
                _setShowAddDepartmentCard(false);
                _setEditingDepartment(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        },
        []
    );

    // Use the custom data hooks
    const {
        data: departments = [],
        isLoading,
        isError,
        error,
        refetch: refetchDepartments,
    } = useAllDepartments();

    // Calculate department statistics locally
    const departmentStats = useMemo(() => {
        const totalDepartments = departments.length;
        const activeDepartmentsCount = departments.filter(
            (dept) => dept.isActive
        ).length;
        const totalFacultiesCount = departments.reduce(
            (count, dept) => count + (dept.faculties?.length || 0),
            0
        );
        const totalSubjectsCount = departments.reduce(
            (count, dept) => count + (dept.subjects?.length || 0),
            0
        );
        const totalSemestersCount = departments.reduce(
            (count, dept) => count + (dept.semesters?.length || 0),
            0
        );

        return {
            totalDepartments,
            activeDepartmentsCount,
            totalFacultiesCount,
            totalSubjectsCount,
            totalSemestersCount,
        };
    }, [departments]);

    // Initialize mutation hooks
    const createDepartmentMutation = useCreateDepartment();
    const updateDepartmentMutation = useUpdateDepartment();
    const softDeleteDepartmentMutation = useSoftDeleteDepartment();

    // Sync local state with hook state (for search and sort)
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleSortOrderChange = useCallback((value: "asc" | "desc") => {
        setSortOrder(value);
    }, []);

    // New department form state (for Add Department Card)
    const [newDepartment, setNewDepartment] = useState<CreateDepartmentData>({
        name: "",
        abbreviation: "",
    });

    // State for editing department (for Edit Department Card)
    const [currentEditDepartment, setCurrentEditDepartment] = useState<
        (UpdateDepartmentData & { id: IdType }) | null
    >(null);

    // Filter and sort data locally
    const filteredAndSortedDepartments = useMemo(() => {
        let filtered = [...departments];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (dept) =>
                    dept.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    dept.abbreviation
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = a.name;
            const bValue = b.name;

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [departments, searchTerm, sortOrder]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearchTerm("");
        setSortOrder("asc");
    }, []);

    // Check if any filters are active
    const hasActiveFilters = searchTerm !== "" || sortOrder !== "asc";

    const handleAddDepartment = useCallback(async () => {
        if (!newDepartment.name.trim() || !newDepartment.abbreviation.trim()) {
            showToast.error(
                "Please fill in all required fields (Name, Abbreviation)"
            );
            return;
        }

        const departmentData: CreateDepartmentData = {
            name: newDepartment.name,
            abbreviation: newDepartment.abbreviation,
        };

        try {
            await createDepartmentMutation.mutateAsync(departmentData);
            showToast.success("Department created!");
            setShowAddDepartmentCard(false); // Close the add card
            // Reset newDepartment state
            setNewDepartment({
                name: "",
                abbreviation: "",
            });
        } catch (err: any) {
            showToast.error(err.message || "Failed to create department");
        }
    }, [newDepartment, createDepartmentMutation, setShowAddDepartmentCard]);

    const handleUpdateDepartment = useCallback(async () => {
        if (!currentEditDepartment || !currentEditDepartment.id) {
            showToast.error("No department selected for update.");
            return;
        }

        // Basic validation for required fields in the update form
        if (
            !currentEditDepartment.name?.trim() ||
            !currentEditDepartment.abbreviation?.trim()
        ) {
            showToast.error(
                "Please fill in all required fields for update (Name, Abbreviation)"
            );
            return;
        }

        try {
            await updateDepartmentMutation.mutateAsync({
                id: currentEditDepartment.id,
                data: {
                    name: currentEditDepartment.name,
                    abbreviation: currentEditDepartment.abbreviation,
                },
            });
            showToast.success("Department updated!");
            setEditingDepartment(null); // Close the edit card
            setCurrentEditDepartment(null); // Clear current edit state
        } catch (err: any) {
            showToast.error(err.message || "Failed to update department");
        }
    }, [currentEditDepartment, updateDepartmentMutation, setEditingDepartment]);

    const confirmDeleteDepartment = useCallback(async () => {
        if (!deletingDepartment) {
            showToast.error("No department selected for deletion.");
            return;
        }
        try {
            await softDeleteDepartmentMutation.mutateAsync(
                deletingDepartment.id
            );
            showToast.success("Department deleted!");
            setDeletingDepartment(null); // Close the delete card
        } catch (err: any) {
            showToast.error(err.message || "Failed to delete department");
            showToast.error("Delete failed: " + err);
        }
    }, [
        deletingDepartment,
        softDeleteDepartmentMutation,
        setDeletingDepartment,
    ]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetchDepartments();
            showToast.success("Department data refreshed!");
        } catch (err: any) {
            showToast.error("Refresh failed: " + err);
            showToast.error(
                err.message || "Failed to refresh department data."
            );
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchDepartments]);

    // Define DataTable columns
    const columns: DataTableColumn<Department>[] = useMemo(
        () => [
            {
                key: "name",
                header: "Department Name",
                sortable: true,
                accessor: (dept) => (
                    <span className="font-medium text-light-text dark:text-dark-text">
                        {dept.name}
                    </span>
                ),
            },
            {
                key: "abbreviation",
                header: "Abbreviation",
                sortable: true,
                accessor: (dept) => (
                    <span className="text-light-text dark:text-dark-text">
                        {dept.abbreviation}
                    </span>
                ),
            },
            {
                key: "hod",
                header: "Head of Department",
                sortable: true,
                accessor: (dept) => (
                    <span className="text-light-text dark:text-dark-text">
                        {dept.hodName || "N/A"}
                    </span>
                ),
            },
            {
                key: "semesters",
                header: "Semesters",
                sortable: true,
                accessor: (dept) => (
                    <span className="text-light-text dark:text-dark-text">
                        {dept.semesters?.length || 0}
                    </span>
                ),
            },
            {
                key: "faculties",
                header: "Faculties",
                sortable: true,
                accessor: (dept) => (
                    <span className="text-light-text dark:text-dark-text">
                        {dept.faculties?.length || 0}
                    </span>
                ),
            },

            {
                key: "subjects",
                header: "Subjects",
                sortable: true,
                accessor: (dept) => (
                    <span className="text-light-text dark:text-dark-text">
                        {dept.subjects?.length || 0}
                    </span>
                ),
            },
            {
                key: "actions",
                header: "Actions",
                accessor: (dept) => (
                    <div className="flex items-center justify-start gap-2">
                        <button
                            onClick={() => {
                                setEditingDepartment(dept);
                                setCurrentEditDepartment({
                                    id: dept.id,
                                    name: dept.name,
                                    abbreviation: dept.abbreviation,
                                });
                            }}
                            className="flex text-sm py-1 px-3 items-center gap-1 bg-transparent border rounded-xl border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-secondary dark:hover:bg-dark-secondary"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>

                        <button
                            onClick={() => setDeletingDepartment(dept)}
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
        [setEditingDepartment, setDeletingDepartment]
    );

    if (isLoading) {
        return <PageLoader text="Loading Departments" />;
    }

    // Display error if data fetch failed and there's no data to show
    if (isError && departments.length === 0) {
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
                        Failed to load department data
                    </h3>
                    <p className="text-light-muted-text dark:text-dark-muted-text mb-6">
                        {error?.message ||
                            "We encountered an error while fetching department data. Please try again."}
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
                                    Department Management
                                </h1>
                                <p className="text-base text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2">
                                    <BuildingOfficeIcon className="h-6 w-6 text-positive-main" />
                                    Manage departments and their details
                                </p>
                            </div>

                            {/* Right Section: Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-1.5 py-2.5 px-4 text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-xl hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
                                    title="Refresh Department Data"
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
                                        setShowAddDepartmentCard(true)
                                    }
                                    className="flex-1 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                             hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                             transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Plus className="h-5 w-5 border-light-text dark:border-dark-text" />
                                        <span className="flex items-center justify-center gap-2">
                                            Add Department
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
                            title="Total Departments"
                            value={departmentStats.totalDepartments}
                            icon={BuildingOfficeIcon}
                            onClick={() => {
                                router.push("/departments");
                            }}
                        />
                        <StatCard
                            title="Total Semesters"
                            value={departmentStats.totalSemestersCount}
                            icon={ClipboardDocumentListIcon}
                            onClick={() => {
                                router.push("/semesters");
                            }}
                        />
                        <StatCard
                            title="Total Faculties"
                            value={departmentStats.totalFacultiesCount}
                            icon={AcademicCapIcon}
                            onClick={() => {
                                router.push("/faculties");
                            }}
                        />
                        <StatCard
                            title="Total Subjects"
                            value={departmentStats.totalSubjectsCount}
                            icon={BookIcon}
                            onClick={() => {
                                router.push("/subjects");
                            }}
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
                                    placeholder="Search by department name or abbreviation..."
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
                                        ? "Sort: Name A-Z"
                                        : "Sort: Name Z-A"}
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

                    {/* Department Add Card */}
                    {showAddDepartmentCard && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Add New Department
                                </h3>
                                <div className="space-y-4 mb-4">
                                    <Input
                                        label="Department Name"
                                        type="text"
                                        value={newDepartment.name}
                                        onChange={(e) =>
                                            setNewDepartment({
                                                ...newDepartment,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="Enter department name"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <Input
                                        label="Abbreviation"
                                        type="text"
                                        value={newDepartment.abbreviation}
                                        onChange={(e) =>
                                            setNewDepartment({
                                                ...newDepartment,
                                                abbreviation: e.target.value,
                                            })
                                        }
                                        placeholder="Enter abbreviation (e.g., CSE)"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setShowAddDepartmentCard(false)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddDepartment}
                                        disabled={
                                            createDepartmentMutation.isPending ||
                                            !newDepartment.name.trim() ||
                                            !newDepartment.abbreviation.trim()
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {createDepartmentMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {createDepartmentMutation.isPending
                                            ? "Adding..."
                                            : "Add Department"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Department Edit Card */}
                    {editingDepartment && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Edit Department: {editingDepartment.name}
                                </h3>
                                <div className="space-y-4 mb-4">
                                    <Input
                                        label="Department Name"
                                        type="text"
                                        value={
                                            currentEditDepartment?.name || ""
                                        }
                                        onChange={(e) =>
                                            setCurrentEditDepartment(
                                                (prev) => ({
                                                    ...(prev as UpdateDepartmentData & {
                                                        id: IdType;
                                                    }),
                                                    name: e.target.value,
                                                })
                                            )
                                        }
                                        placeholder="Enter department name"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <Input
                                        label="Abbreviation"
                                        type="text"
                                        value={
                                            currentEditDepartment?.abbreviation ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            setCurrentEditDepartment(
                                                (prev) => ({
                                                    ...(prev as UpdateDepartmentData & {
                                                        id: IdType;
                                                    }),
                                                    abbreviation:
                                                        e.target.value,
                                                })
                                            )
                                        }
                                        placeholder="Enter abbreviation (e.g., CSE)"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setEditingDepartment(null)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateDepartment}
                                        disabled={
                                            updateDepartmentMutation.isPending ||
                                            !currentEditDepartment?.name?.trim() ||
                                            !currentEditDepartment?.abbreviation?.trim()
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updateDepartmentMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {updateDepartmentMutation.isPending
                                            ? "Updating..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Department Delete Card */}
                    {deletingDepartment && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Confirm Deletion
                                </h3>
                                <p className="text-light-text dark:text-dark-text mb-6">
                                    Are you sure you want to delete department{" "}
                                    <span className="font-semibold">
                                        {deletingDepartment.name}
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setDeletingDepartment(null)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text hover:shadow-lg dark:hover:shadow-gray-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteDepartment}
                                        disabled={
                                            softDeleteDepartmentMutation.isPending
                                        }
                                        className="text-sm flex items-center gap-2 bg-red-600 dark:bg-red-500 text-white py-2.5 px-4 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {softDeleteDepartmentMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <Trash2 className="h-5 w-5" />
                                        )}
                                        {softDeleteDepartmentMutation.isPending
                                            ? "Deleting..."
                                            : "Confirm Delete"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Department Data Table */}
                    <motion.div variants={itemVariants}>
                        <DataTable
                            data={filteredAndSortedDepartments}
                            columns={columns}
                            loading={isLoading}
                            emptyMessage="No departments found"
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

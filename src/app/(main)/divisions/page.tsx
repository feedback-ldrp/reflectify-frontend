// src/app/divisions/page.tsx
"use client";

import { useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { showToast } from "@/lib/toast";
import { StatCard } from "@/components/ui/StatCard";
import {
    useAllDivisions,
    useCreateDivision,
    useUpdateDivision,
    useSoftDeleteDivision,
} from "@/hooks/useDivisions"; // Importing from the provided hook file
import { useAllDepartments } from "@/hooks/useDepartments"; // To get departments for filter/dropdown
import { useAllSemesters } from "@/hooks/useSemesters"; // To get semesters for filter/dropdown
import {
    LayoutGrid, // Icon for divisions
    RefreshCw,
    Plus,
    X,
    Search,
    Edit,
    Trash2,
    Loader,
    CheckIcon,
    BookCheckIcon,
    FileTextIcon,
} from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, Select } from "@/components/ui";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import {
    Division,
    CreateDivisionData,
    UpdateDivisionData,
} from "@/interfaces/division";
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

export default function DivisionManagement() {
    const router = useRouter();

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<
        IdType | ""
    >("");
    const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<
        IdType | ""
    >("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Card visibility states
    const [showAddDivisionCard, _setShowAddDivisionCard] = useState(false);
    const [editingDivision, _setEditingDivision] = useState<Division | null>(
        null
    );
    const [deletingDivision, _setDeletingDivision] = useState<Division | null>(
        null
    );

    // Helper function to manage card visibility and scroll
    const setShowAddDivisionCard = useCallback((show: boolean) => {
        _setShowAddDivisionCard(show);
        if (show) {
            _setEditingDivision(null);
            _setDeletingDivision(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const setEditingDivision = useCallback((division: Division | null) => {
        _setEditingDivision(division);
        if (division) {
            _setShowAddDivisionCard(false);
            _setDeletingDivision(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const setDeletingDivision = useCallback((division: Division | null) => {
        _setDeletingDivision(division);
        if (division) {
            _setShowAddDivisionCard(false);
            _setEditingDivision(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    // Use the custom data hooks
    const {
        data: divisions = [],
        isLoading,
        isError,
        error,
        refetch: refetchDivisions,
    } = useAllDivisions({
        departmentId:
            selectedDepartmentFilter === ""
                ? undefined
                : selectedDepartmentFilter,
        semesterId:
            selectedSemesterFilter === "" ? undefined : selectedSemesterFilter,
    });
    const { data: departments = [], isLoading: isLoadingDepartments } =
        useAllDepartments();
    const { data: semesters = [], isLoading: isLoadingSemesters } =
        useAllSemesters();

    // Calculate division statistics locally
    const divisionStats = useMemo(() => {
        const totalDivisions = divisions.length;

        const totalSubjectAllocations = divisions.reduce((acc, div) => {
            return acc + (div.subjectAllocations?.length || 0);
        }, 0);
        const totalFeedbackForms = divisions.reduce((acc, div) => {
            return acc + (div.feedbackForms?.length || 0);
        }, 0);

        return {
            totalDivisions,
            totalSubjectAllocations,
            totalFeedbackForms,
        };
    }, [divisions]);

    // Initialize mutation hooks
    const createDivisionMutation = useCreateDivision();
    const updateDivisionMutation = useUpdateDivision();
    const softDeleteDivisionMutation = useSoftDeleteDivision();

    // Sync local state with hook state (for search and sort)
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleSortOrderChange = useCallback((value: "asc" | "desc") => {
        setSortOrder(value);
    }, []);

    // New division form state (for Add Division Card)
    const [newDivision, setNewDivision] = useState<CreateDivisionData>({
        divisionName: "",
        departmentId: "",
        semesterId: "",
    });

    // State for editing division (for Edit Division Card)
    const [currentEditDivision, setCurrentEditDivision] = useState<
        (UpdateDivisionData & { id: IdType }) | null
    >(null);

    // Filter and sort data locally
    const filteredAndSortedDivisions = useMemo(() => {
        let filtered = [...divisions];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (div) =>
                    div.divisionName
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    div.departmentId
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) || // Assuming departmentId is searchable string
                    div.semesterId
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) // Assuming semesterId is searchable string
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = a.divisionName; // Default sort by divisionName
            const bValue = b.divisionName;

            if (sortOrder === "asc") {
                if (aValue < bValue) return -1;
                if (aValue > bValue) return 1;
            } else {
                if (aValue < bValue) return 1;
                if (aValue > bValue) return -1;
            }
            return 0;
        });

        return filtered;
    }, [divisions, searchTerm, sortOrder]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearchTerm("");
        setSelectedDepartmentFilter("");
        setSelectedSemesterFilter("");
        setSortOrder("asc");
    }, []);

    // Check if any filters are active
    const hasActiveFilters =
        searchTerm !== "" ||
        selectedDepartmentFilter !== "" ||
        selectedSemesterFilter !== "" ||
        sortOrder !== "asc";

    const handleAddDivision = useCallback(async () => {
        if (
            !newDivision.divisionName.trim() ||
            !newDivision.departmentId ||
            !newDivision.semesterId
        ) {
            showToast.error(
                "Please fill in all required fields (Division Name, Department, Semester)"
            );
            return;
        }

        const divisionData: CreateDivisionData = {
            divisionName: newDivision.divisionName,
            departmentId: newDivision.departmentId,
            semesterId: newDivision.semesterId,
        };

        try {
            await createDivisionMutation.mutateAsync(divisionData);
            showToast.success("Division created!");
            setShowAddDivisionCard(false); // Close the add card
            // Reset newDivision state
            setNewDivision({
                divisionName: "",
                departmentId: "",
                semesterId: "",
            });
        } catch (err: any) {
            showToast.error(err.message || "Failed to create division");
        }
    }, [newDivision, createDivisionMutation, setShowAddDivisionCard]);

    const handleUpdateDivision = useCallback(async () => {
        if (!currentEditDivision || !currentEditDivision.id) {
            showToast.error("No division selected for update.");
            return;
        }

        // Basic validation for required fields in the update form
        if (
            !currentEditDivision.divisionName?.trim() ||
            !currentEditDivision.departmentId ||
            !currentEditDivision.semesterId
        ) {
            showToast.error(
                "Please fill in all required fields for update (Division Name, Department, Semester)"
            );
            return;
        }

        try {
            await updateDivisionMutation.mutateAsync({
                id: currentEditDivision.id,
                data: {
                    divisionName: currentEditDivision.divisionName,
                    departmentId: currentEditDivision.departmentId,
                    semesterId: currentEditDivision.semesterId,
                    isActive: currentEditDivision.isActive,
                },
            });
            showToast.success("Division updated!");
            setEditingDivision(null); // Close the edit card
            setCurrentEditDivision(null); // Clear current edit state
        } catch (err: any) {
            showToast.error(err.message || "Failed to update division");
        }
    }, [currentEditDivision, updateDivisionMutation, setEditingDivision]);

    const confirmDeleteDivision = useCallback(async () => {
        if (!deletingDivision) {
            showToast.error("No division selected for deletion.");
            return;
        }
        try {
            await softDeleteDivisionMutation.mutateAsync(deletingDivision.id);
            showToast.success("Division deleted!");
            setDeletingDivision(null); // Close the delete card
        } catch (err: any) {
            showToast.error(err.message || "Failed to delete division");
        }
    }, [deletingDivision, softDeleteDivisionMutation, setDeletingDivision]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetchDivisions();
            showToast.success("Division data refreshed!");
        } catch (err: any) {
            showToast.error(err.message || "Failed to refresh division data.");
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchDivisions]);

    // Define DataTable columns
    const columns: DataTableColumn<Division>[] = useMemo(
        () => [
            {
                key: "divisionName",
                header: "Division Name",
                sortable: true,
                accessor: (div) => (
                    <span className="font-medium text-light-text dark:text-dark-text">
                        {div.divisionName}
                    </span>
                ),
            },
            {
                key: "department",
                header: "Department",
                sortable: true,
                accessor: (div) => {
                    const department = departments.find(
                        (d) => d.id === div.departmentId
                    );
                    return (
                        <span className="text-light-text dark:text-dark-text">
                            {department?.name || "N/A"}
                        </span>
                    );
                },
            },
            {
                key: "semester",
                header: "Semester",
                sortable: true,
                accessor: (div) => {
                    const semester = semesters.find(
                        (s) => s.id === div.semesterId
                    );
                    return (
                        <span className="text-light-text dark:text-dark-text">
                            Semester {semester?.semesterNumber || "N/A"}
                        </span>
                    );
                },
            },
            {
                key: "subjectAllocations",
                header: "Subject Allocations",
                sortable: true,
                accessor: (div) => {
                    const subjectAllocations = div.subjectAllocations || [];
                    return (
                        <span className="text-light-text dark:text-dark-text">
                            {subjectAllocations.length > 0
                                ? subjectAllocations.length
                                : "0"}
                        </span>
                    );
                },
            },
            {
                key: "feedbackForms",
                header: "Feedback Forms",
                sortable: true,
                accessor: (div) => {
                    const feedbackForms = div.feedbackForms || [];
                    return (
                        <span className="text-light-text dark:text-dark-text">
                            {feedbackForms.length > 0
                                ? feedbackForms.length
                                : "0"}
                        </span>
                    );
                },
            },
            {
                key: "actions",
                header: "Actions",
                accessor: (div) => (
                    <div className="flex items-center justify-start gap-2">
                        <button
                            onClick={() => {
                                setEditingDivision(div);
                                setCurrentEditDivision({
                                    id: div.id,
                                    divisionName: div.divisionName, // map divisionName to name for the form
                                    departmentId: div.departmentId,
                                    semesterId: div.semesterId,
                                    isActive: div.isActive,
                                });
                            }}
                            className="flex text-sm py-1 px-3 items-center gap-1 bg-transparent border rounded-xl border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-secondary dark:hover:bg-dark-secondary"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>

                        <button
                            onClick={() => setDeletingDivision(div)}
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
        [setEditingDivision, setDeletingDivision, departments, semesters] // Add departments and semesters to dependencies
    );

    if (isLoading || isLoadingDepartments || isLoadingSemesters) {
        return <PageLoader text="Loading Divisions" />;
    }

    // Display error if data fetch failed and there's no data to show
    if (isError && divisions.length === 0) {
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
                        Failed to load division data
                    </h3>
                    <p className="text-light-muted-text dark:text-dark-muted-text mb-6">
                        {error?.message ||
                            "We encountered an error while fetching division data. Please try again."}
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
                                    Division Management
                                </h1>
                                <p className="text-base text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2">
                                    <LayoutGrid className="h-6 w-6 text-positive-main" />
                                    Manage academic divisions and their details
                                </p>
                            </div>

                            {/* Right Section: Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-1.5 py-2.5 px-4 text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-xl hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
                                    title="Refresh Division Data"
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
                                    onClick={() => setShowAddDivisionCard(true)}
                                    className="flex-1 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                             hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                             transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Plus className="h-5 w-5 border-light-text dark:border-dark-text" />
                                        <span className="flex items-center justify-center gap-2">
                                            Add Division
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Cards */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <StatCard
                            title="Total Divisions"
                            value={divisionStats.totalDivisions}
                            icon={LayoutGrid}
                            onClick={() => {
                                router.push("/divisions");
                            }}
                        />
                        <StatCard
                            title="Total Subject Allocations"
                            value={divisionStats.totalSubjectAllocations}
                            icon={BookCheckIcon}
                            onClick={() => {
                                showToast.error("Not Allowed");
                            }}
                        />
                        <StatCard
                            title="Total Feedback Forms"
                            value={divisionStats.totalFeedbackForms}
                            icon={FileTextIcon}
                            onClick={() => {
                                router.push("/feedback-forms");
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
                                    placeholder="Search by division name..."
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

                                {/* Department Filter */}
                                <Select
                                    id="department-filter"
                                    name="department-filter"
                                    value={selectedDepartmentFilter}
                                    onChange={(e) =>
                                        setSelectedDepartmentFilter(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </Select>

                                {/* Semester Filter */}
                                <Select
                                    id="semester-filter"
                                    name="semester-filter"
                                    value={selectedSemesterFilter}
                                    onChange={(e) =>
                                        setSelectedSemesterFilter(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">All Semesters</option>
                                    {semesters.map((sem) => (
                                        <option key={sem.id} value={sem.id}>
                                            {sem.semesterNumber} (
                                            {sem.academicYear?.yearString})
                                        </option>
                                    ))}
                                </Select>

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

                    {/* Division Add Card */}
                    {showAddDivisionCard && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Add New Division
                                </h3>
                                <div className="space-y-4 mb-4">
                                    <Input
                                        label="Division Name"
                                        type="text"
                                        value={newDivision.divisionName}
                                        onChange={(e) =>
                                            setNewDivision({
                                                ...newDivision,
                                                divisionName: e.target.value,
                                            })
                                        }
                                        placeholder="Enter division name (e.g., A, B)"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Department
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="new-division-department"
                                                name="new-division-department"
                                                value={newDivision.departmentId}
                                                onChange={(e) =>
                                                    setNewDivision({
                                                        ...newDivision,
                                                        departmentId:
                                                            e.target.value,
                                                    })
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select Department
                                                </option>
                                                {departments.map((dept) => (
                                                    <option
                                                        key={dept.id}
                                                        value={dept.id}
                                                    >
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Semester
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="new-division-semester"
                                                name="new-division-semester"
                                                value={newDivision.semesterId}
                                                onChange={(e) =>
                                                    setNewDivision({
                                                        ...newDivision,
                                                        semesterId:
                                                            e.target.value,
                                                    })
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select Semester
                                                </option>
                                                {semesters.map((sem) => (
                                                    <option
                                                        key={sem.id}
                                                        value={sem.id}
                                                    >
                                                        {sem.semesterNumber} (
                                                        {
                                                            sem.academicYear
                                                                ?.yearString
                                                        }
                                                        )
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setShowAddDivisionCard(false)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddDivision}
                                        disabled={
                                            createDivisionMutation.isPending ||
                                            !newDivision.divisionName.trim() ||
                                            !newDivision.departmentId ||
                                            !newDivision.semesterId
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {createDivisionMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {createDivisionMutation.isPending
                                            ? "Adding..."
                                            : "Add Division"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Division Edit Card */}
                    {editingDivision && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Edit Division:{" "}
                                    {editingDivision.semester?.semesterNumber}
                                    {editingDivision.divisionName} (
                                    {editingDivision.department?.name ||
                                        "Unknown"}{" "}
                                    Department)
                                </h3>
                                <div className="space-y-4 mb-4">
                                    <Input
                                        label="Division Name"
                                        type="text"
                                        value={
                                            currentEditDivision?.divisionName ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            setCurrentEditDivision((prev) => ({
                                                ...(prev as UpdateDivisionData & {
                                                    id: IdType;
                                                }),
                                                divisionName: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter division name (e.g., A, B)"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Department
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="edit-division-department"
                                                name="edit-division-department"
                                                value={
                                                    currentEditDivision?.departmentId ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setCurrentEditDivision(
                                                        (prev) => ({
                                                            ...(prev as UpdateDivisionData & {
                                                                id: IdType;
                                                            }),
                                                            departmentId:
                                                                e.target.value,
                                                        })
                                                    )
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select Department
                                                </option>
                                                {departments.map((dept) => (
                                                    <option
                                                        key={dept.id}
                                                        value={dept.id}
                                                    >
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Semester
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="edit-division-semester"
                                                name="edit-division-semester"
                                                value={
                                                    currentEditDivision?.semesterId ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setCurrentEditDivision(
                                                        (prev) => ({
                                                            ...(prev as UpdateDivisionData & {
                                                                id: IdType;
                                                            }),
                                                            semesterId:
                                                                e.target.value,
                                                        })
                                                    )
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select Semester
                                                </option>
                                                {semesters.map((sem) => (
                                                    <option
                                                        key={sem.id}
                                                        value={sem.id}
                                                    >
                                                        {sem.semesterNumber} (
                                                        {
                                                            sem.academicYear
                                                                ?.yearString
                                                        }
                                                        )
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() => setEditingDivision(null)}
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateDivision}
                                        disabled={
                                            updateDivisionMutation.isPending ||
                                            !currentEditDivision?.divisionName?.trim() ||
                                            !currentEditDivision?.departmentId ||
                                            !currentEditDivision?.semesterId
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updateDivisionMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {updateDivisionMutation.isPending
                                            ? "Updating..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Division Delete Card */}
                    {deletingDivision && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Confirm Deletion
                                </h3>
                                <p className="text-light-text dark:text-dark-text mb-6">
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold">
                                        Division {deletingDivision.divisionName}{" "}
                                        of Semester{" "}
                                        {deletingDivision.semester
                                            ?.semesterNumber || ""}{" "}
                                        (
                                        {deletingDivision.department?.name ||
                                            ""}{" "}
                                        Department)
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setDeletingDivision(null)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text hover:shadow-lg dark:hover:shadow-gray-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteDivision}
                                        disabled={
                                            softDeleteDivisionMutation.isPending
                                        }
                                        className="text-sm flex items-center gap-2 bg-red-600 dark:bg-red-500 text-white py-2.5 px-4 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {softDeleteDivisionMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <Trash2 className="h-5 w-5" />
                                        )}
                                        {softDeleteDivisionMutation.isPending
                                            ? "Deleting..."
                                            : "Confirm Delete"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Division Data Table */}
                    <motion.div variants={itemVariants}>
                        <DataTable
                            data={filteredAndSortedDivisions}
                            columns={columns}
                            loading={isLoading}
                            emptyMessage="No divisions found"
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

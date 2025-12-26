// src/app/semesters/page.tsx
"use client";

import { useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { showToast } from "@/lib/toast";
import { StatCard } from "@/components/ui/StatCard";
import {
    useAllSemesters,
    useCreateSemester,
    useUpdateSemester,
    useSoftDeleteSemester,
} from "@/hooks/useSemesters";
import { useAllDepartments } from "@/hooks/useDepartments"; // To get departments for filter/dropdown
import { useAllAcademicYears } from "@/hooks/useAcademicYears"; // To get academic years for filter/dropdown
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
    BookCheckIcon,
    LayoutGridIcon,
} from "lucide-react";
import {
    ClipboardDocumentListIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, Select } from "@/components/ui";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import {
    Semester,
    CreateSemesterData,
    UpdateSemesterData,
    GetSemestersFilters,
} from "@/interfaces/semester";
import { IdType } from "@/interfaces/common";
import { SemesterTypeEnum } from "@/constants/semesterTypes";
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

export default function SemesterManagement() {
    const router = useRouter();

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<
        IdType | ""
    >("");
    const [selectedAcademicYearFilter, setSelectedAcademicYearFilter] =
        useState<IdType | "">("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Card visibility states
    const [showAddSemesterCard, _setShowAddSemesterCard] = useState(false);
    const [editingSemester, _setEditingSemester] = useState<Semester | null>(
        null
    );
    const [deletingSemester, _setDeletingSemester] = useState<Semester | null>(
        null
    );

    // Helper function to manage card visibility and scroll
    const setShowAddSemesterCard = useCallback((show: boolean) => {
        _setShowAddSemesterCard(show);
        if (show) {
            _setEditingSemester(null);
            _setDeletingSemester(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const setEditingSemester = useCallback((semester: Semester | null) => {
        _setEditingSemester(semester);
        if (semester) {
            _setShowAddSemesterCard(false);
            _setDeletingSemester(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const setDeletingSemester = useCallback((semester: Semester | null) => {
        _setDeletingSemester(semester);
        if (semester) {
            _setShowAddSemesterCard(false);
            _setEditingSemester(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    // Use the custom data hooks
    const filters: GetSemestersFilters = useMemo(
        () => ({
            departmentId:
                selectedDepartmentFilter === ""
                    ? undefined
                    : selectedDepartmentFilter,
            academicYearId:
                selectedAcademicYearFilter === ""
                    ? undefined
                    : selectedAcademicYearFilter,
        }),
        [selectedDepartmentFilter, selectedAcademicYearFilter]
    );

    const {
        data: semesters = [],
        isLoading,
        isError,
        error,
        refetch: refetchSemesters,
    } = useAllSemesters({ filters });
    const { data: departments = [], isLoading: isLoadingDepartments } =
        useAllDepartments();
    const { data: academicYears = [], isLoading: isLoadingAcademicYears } =
        useAllAcademicYears();

    // Calculate semester statistics locally
    const semesterStats = useMemo(() => {
        const totalSemesters = semesters.length;
        const activeSemestersCount = semesters.filter(
            (sem) => sem.isActive
        ).length;
        const totalDivisions = semesters.reduce(
            (count, sem) => count + (sem.divisions?.length || 0),
            0
        );
        const totalSubjects = semesters.reduce((count, sem) => {
            return count + (sem.subjects?.length || 0);
        }, 0);

        const totalSubjectAllocations = semesters.reduce((count, sem) => {
            return count + (sem.allocations?.length || 0);
        }, 0);
        return {
            totalSemesters,
            activeSemestersCount,
            totalDivisions,
            totalSubjects,
            totalSubjectAllocations,
        };
    }, [semesters]);

    // Initialize mutation hooks
    const createSemesterMutation = useCreateSemester();
    const updateSemesterMutation = useUpdateSemester();
    const softDeleteSemesterMutation = useSoftDeleteSemester();

    // Sync local state with hook state (for search and sort)
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleSortOrderChange = useCallback((value: "asc" | "desc") => {
        setSortOrder(value);
    }, []);

    // New semester form state (for Add Semester Card)
    const [newSemester, setNewSemester] = useState<CreateSemesterData>({
        semesterNumber: 1,
        academicYearId: "",
        departmentId: "",
        semesterType: SemesterTypeEnum.ODD,
    });

    // State for editing semester (for Edit Semester Card)
    const [currentEditSemester, setCurrentEditSemester] = useState<
        (UpdateSemesterData & { id: IdType }) | null
    >(null);

    // Filter and sort data locally
    const filteredAndSortedSemesters = useMemo(() => {
        let filtered = [...semesters];

        // Filter by department
        if (selectedDepartmentFilter) {
            filtered = filtered.filter(
                (sem) => sem.departmentId === selectedDepartmentFilter
            );
        }

        // Filter by academic year
        if (selectedAcademicYearFilter) {
            filtered = filtered.filter(
                (sem) => sem.academicYearId === selectedAcademicYearFilter
            );
        }

        // Apply search filter (semester number, academic year string, department name)
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter((sem) =>
                [
                    `Semester ${sem.semesterNumber}`.toLowerCase(),
                    sem.academicYear?.yearString?.toLowerCase() || "",
                    sem.department?.name?.toLowerCase() || "",
                ].some((field) => field.includes(lowerSearch))
            );
        }

        // Sort by semester number, then by academic year string, then by department name
        filtered.sort((a, b) => {
            // Primary: semester number
            if (a.semesterNumber !== b.semesterNumber) {
                return sortOrder === "asc"
                    ? a.semesterNumber - b.semesterNumber
                    : b.semesterNumber - a.semesterNumber;
            }
            // Secondary: academic year string
            const aYear = a.academicYear?.yearString || "";
            const bYear = b.academicYear?.yearString || "";
            if (aYear !== bYear) {
                return sortOrder === "asc"
                    ? aYear.localeCompare(bYear)
                    : bYear.localeCompare(aYear);
            }
            // Tertiary: department name
            const aDept = a.department?.name || "";
            const bDept = b.department?.name || "";
            return sortOrder === "asc"
                ? aDept.localeCompare(bDept)
                : bDept.localeCompare(aDept);
        });

        return filtered;
    }, [
        semesters,
        searchTerm,
        sortOrder,
        selectedDepartmentFilter,
        selectedAcademicYearFilter,
    ]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearchTerm("");
        setSelectedDepartmentFilter("");
        setSelectedAcademicYearFilter("");
        setSortOrder("asc");
    }, []);

    // Check if any filters are active
    const hasActiveFilters =
        searchTerm !== "" ||
        selectedDepartmentFilter !== "" ||
        selectedAcademicYearFilter !== "" ||
        sortOrder !== "asc";

    const handleAddSemester = useCallback(async () => {
        if (
            !newSemester.semesterNumber ||
            !newSemester.academicYearId ||
            !newSemester.departmentId
        ) {
            showToast.error(
                "Please fill in all required fields (Name, Semester Number, Academic Year, Department)"
            );
            return;
        }

        const semesterData: CreateSemesterData = {
            semesterNumber: newSemester.semesterNumber,
            academicYearId: newSemester.academicYearId,
            departmentId: newSemester.departmentId,
            semesterType:
                newSemester.semesterNumber % 2 === 0
                    ? SemesterTypeEnum.EVEN
                    : SemesterTypeEnum.ODD,
        };

        try {
            await createSemesterMutation.mutateAsync(semesterData);
            showToast.success("Semester created!");
            setShowAddSemesterCard(false); // Close the add card
            // Reset newSemester state
            setNewSemester({
                semesterNumber: 1,
                academicYearId: "",
                departmentId: "",
                semesterType: SemesterTypeEnum.ODD,
            });
        } catch (err: any) {
            showToast.error(err.message || "Failed to create semester");
        }
    }, [newSemester, createSemesterMutation, setShowAddSemesterCard]);

    const handleUpdateSemester = useCallback(async () => {
        if (!currentEditSemester || !currentEditSemester.id) {
            showToast.error("No semester selected for update.");
            return;
        }

        // Basic validation for required fields in the update form
        if (
            !currentEditSemester.semesterNumber ||
            !currentEditSemester.academicYearId ||
            !currentEditSemester.departmentId
        ) {
            showToast.error(
                "Please fill in all required fields for update (Name, Semester Number, Academic Year, Department)"
            );
            return;
        }

        try {
            await updateSemesterMutation.mutateAsync({
                id: currentEditSemester.id,
                data: {
                    semesterNumber: currentEditSemester.semesterNumber,
                    academicYearId: currentEditSemester.academicYearId,
                    departmentId: currentEditSemester.departmentId,
                },
            });
            showToast.success("Semester updated!");
            setEditingSemester(null); // Close the edit card
            setCurrentEditSemester(null); // Clear current edit state
        } catch (err: any) {
            showToast.error(err.message || "Failed to update semester");
        }
    }, [currentEditSemester, updateSemesterMutation, setEditingSemester]);

    const confirmDeleteSemester = useCallback(async () => {
        if (!deletingSemester) {
            showToast.error("No semester selected for deletion.");
            return;
        }
        try {
            await softDeleteSemesterMutation.mutateAsync(deletingSemester.id);
            showToast.success("Semester deleted!");
            setDeletingSemester(null); // Close the delete card
        } catch (err: any) {
            showToast.error(err.message || "Failed to delete semester");
        }
    }, [deletingSemester, softDeleteSemesterMutation, setDeletingSemester]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetchSemesters();
            showToast.success("Semester data refreshed!");
        } catch (err: any) {
            showToast.error(err.message || "Failed to refresh semester data.");
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchSemesters]);

    // Define DataTable columns
    const columns: DataTableColumn<Semester>[] = useMemo(
        () => [
            {
                key: "semesterNumber",
                header: "Semester",
                sortable: true,
                accessor: (sem) => (
                    <span className="text-light-text dark:text-dark-text">
                        Semester {sem.semesterNumber}
                    </span>
                ),
            },
            {
                key: "academicYear",
                header: "Academic Year",
                sortable: true,
                accessor: (sem) => (
                    <span className="text-light-text dark:text-dark-text">
                        {sem.academicYear?.yearString || "N/A"}
                    </span>
                ),
            },
            {
                key: "department",
                header: "Department",
                sortable: true,
                accessor: (sem) => (
                    <span className="text-light-text dark:text-dark-text">
                        {sem.department?.name || "N/A"}
                    </span>
                ),
            },
            {
                key: "divisions",
                header: "Divisions",
                sortable: true,
                accessor: (sem) => (
                    <span className="text-light-text dark:text-dark-text">
                        {sem.divisions?.length || "0"}
                    </span>
                ),
            },
            {
                key: "subjects",
                header: "Subjects",
                sortable: true,
                accessor: (sem) => (
                    <span className="text-light-text dark:text-dark-text">
                        {sem.subjects?.length || "0"}
                    </span>
                ),
            },
            {
                key: "subjectAllocations",
                header: "Subject Allocations",
                sortable: true,
                accessor: (sem) => (
                    <span className="text-light-text dark:text-dark-text">
                        {sem.allocations?.length || "0"}
                    </span>
                ),
            },
            {
                key: "actions",
                header: "Actions",
                accessor: (sem) => (
                    <div>
                        <div className="flex items-start justify-start gap-2">
                            <button
                                onClick={() => {
                                    setEditingSemester(sem);
                                    setCurrentEditSemester({
                                        id: sem.id,
                                        semesterNumber: sem.semesterNumber,
                                        academicYearId: sem.academicYearId,
                                        departmentId: sem.departmentId,
                                        isActive: sem.isActive,
                                    });
                                }}
                                className="flex text-sm py-1 px-3 items-center gap-1 bg-transparent border rounded-xl border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-secondary dark:hover:bg-dark-secondary"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </button>

                            <button
                                onClick={() => setDeletingSemester(sem)}
                                className="flex text-sm py-1 px-3 items-center gap-1 bg-transparent border rounded-xl border-red-600
                               text-red-600 dark:text-red-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-500 hover:bg-negative-main/10 dark:hover:bg-negative-dark/10"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                ),
            },
        ],
        [setEditingSemester, setDeletingSemester]
    );

    if (isLoading || isLoadingDepartments || isLoadingAcademicYears) {
        return <PageLoader text="Loading Semesters" />;
    }

    // Display error if data fetch failed and there's no data to show
    if (isError && semesters.length === 0) {
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
                        Failed to load semester data
                    </h3>
                    <p className="text-light-muted-text dark:text-dark-muted-text mb-6">
                        {error?.message ||
                            "We encountered an error while fetching semester data. Please try again."}
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
                                    Semester Management
                                </h1>
                                <p className="text-base text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2">
                                    <ClipboardDocumentListIcon className="h-6 w-6 text-positive-main" />
                                    Manage academic semesters and their details
                                </p>
                            </div>

                            {/* Right Section: Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-1.5 py-2.5 px-4 text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-xl hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
                                    title="Refresh Semester Data"
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
                                    onClick={() => setShowAddSemesterCard(true)}
                                    className="flex-1 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                             hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                             transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Plus className="h-5 w-5 border-light-text dark:border-dark-text" />
                                        <span className="flex items-center justify-center gap-2">
                                            Add Semester
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
                            title="Total Semesters"
                            value={semesterStats.totalSemesters}
                            icon={ClipboardDocumentListIcon}
                            onClick={() => {
                                router.push("/semesters");
                            }}
                        />
                        <StatCard
                            title="Total Divisions"
                            value={semesterStats.totalDivisions}
                            icon={LayoutGridIcon}
                            onClick={() => {
                                router.push("/divisions");
                            }}
                        />
                        <StatCard
                            title="Total Subjects"
                            value={semesterStats.totalSubjects}
                            icon={BookIcon}
                            onClick={() => {
                                router.push("/subjects");
                            }}
                        />
                        <StatCard
                            title="Total Subject Allocations"
                            value={semesterStats.totalSubjectAllocations}
                            icon={BookCheckIcon}
                            onClick={() => {
                                showToast.error("Not Allowed");
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
                                    placeholder="Search by name, number, year, or department..."
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

                                {/* Academic Year Filter */}
                                <Select
                                    id="academic-year-filter"
                                    name="academic-year-filter"
                                    value={selectedAcademicYearFilter}
                                    onChange={(e) =>
                                        setSelectedAcademicYearFilter(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">All Academic Years</option>
                                    {academicYears.map((year) => (
                                        <option key={year.id} value={year.id}>
                                            {year.yearString}
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

                    {/* Semester Add Card */}
                    {showAddSemesterCard && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Add New Semester
                                </h3>
                                <div className="space-y-4 mb-4">
                                    <Input
                                        label="Semester Number"
                                        type="number"
                                        value={newSemester.semesterNumber}
                                        min={1}
                                        max={8}
                                        onChange={(e) => {
                                            const value = Math.max(
                                                1,
                                                Math.min(
                                                    8,
                                                    parseInt(e.target.value) ||
                                                        1
                                                )
                                            );
                                            setNewSemester({
                                                ...newSemester,
                                                semesterNumber: value,
                                            });
                                        }}
                                        placeholder="Enter semester number (1-8)"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Academic Year
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="new-academic-year"
                                                name="new-academic-year"
                                                value={
                                                    newSemester.academicYearId
                                                }
                                                onChange={(e) =>
                                                    setNewSemester({
                                                        ...newSemester,
                                                        academicYearId:
                                                            e.target.value,
                                                    })
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select Academic Year
                                                </option>
                                                {academicYears.map((year) => (
                                                    <option
                                                        key={year.id}
                                                        value={year.id}
                                                    >
                                                        {year.yearString}
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Department
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="new-department"
                                                name="new-department"
                                                value={newSemester.departmentId}
                                                onChange={(e) =>
                                                    setNewSemester({
                                                        ...newSemester,
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
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setShowAddSemesterCard(false)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddSemester}
                                        disabled={
                                            createSemesterMutation.isPending ||
                                            !newSemester.semesterNumber ||
                                            !newSemester.academicYearId ||
                                            !newSemester.departmentId
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {createSemesterMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {createSemesterMutation.isPending
                                            ? "Adding..."
                                            : "Add Semester"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Semester Edit Card */}
                    {editingSemester && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Edit Semester:{" "}
                                    {editingSemester.semesterNumber}
                                </h3>
                                <div className="space-y-4 mb-4">
                                    <Input
                                        label="Semester Number"
                                        type="number"
                                        min={1}
                                        max={8}
                                        value={
                                            currentEditSemester?.semesterNumber ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            setCurrentEditSemester((prev) => ({
                                                ...(prev as UpdateSemesterData & {
                                                    id: IdType;
                                                }),
                                                semesterNumber: Math.max(
                                                    1,
                                                    Math.min(
                                                        8,
                                                        parseInt(
                                                            e.target.value
                                                        ) || 1
                                                    )
                                                ),
                                            }))
                                        }
                                        placeholder="Enter semester number (1-8)"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Academic Year
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="edit-academic-year"
                                                name="edit-academic-year"
                                                value={
                                                    currentEditSemester?.academicYearId ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setCurrentEditSemester(
                                                        (prev) => ({
                                                            ...(prev as UpdateSemesterData & {
                                                                id: IdType;
                                                            }),
                                                            academicYearId:
                                                                e.target.value,
                                                        })
                                                    )
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select Academic Year
                                                </option>
                                                {academicYears.map((year) => (
                                                    <option
                                                        key={year.id}
                                                        value={year.id}
                                                    >
                                                        {year.yearString}
                                                    </option>
                                                ))}
                                            </Select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Department
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="edit-department"
                                                name="edit-department"
                                                value={
                                                    currentEditSemester?.departmentId ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setCurrentEditSemester(
                                                        (prev) => ({
                                                            ...(prev as UpdateSemesterData & {
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
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() => setEditingSemester(null)}
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateSemester}
                                        disabled={
                                            updateSemesterMutation.isPending ||
                                            !currentEditSemester?.semesterNumber ||
                                            !currentEditSemester?.academicYearId ||
                                            !currentEditSemester?.departmentId
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updateSemesterMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {updateSemesterMutation.isPending
                                            ? "Updating..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Semester Delete Card */}
                    {deletingSemester && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Confirm Deletion
                                </h3>
                                <p className="text-light-text dark:text-dark-text mb-6">
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold">
                                        {" "}
                                        Semester{" "}
                                        {deletingSemester.semesterNumber} (
                                        {
                                            deletingSemester.academicYear!
                                                .yearString
                                        }
                                        )
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setDeletingSemester(null)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text hover:shadow-lg dark:hover:shadow-gray-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteSemester}
                                        disabled={
                                            softDeleteSemesterMutation.isPending
                                        }
                                        className="text-sm flex items-center gap-2 bg-red-600 dark:bg-red-500 text-white py-2.5 px-4 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {softDeleteSemesterMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <Trash2 className="h-5 w-5" />
                                        )}
                                        {softDeleteSemesterMutation.isPending
                                            ? "Deleting..."
                                            : "Confirm Delete"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Semester Data Table */}
                    <motion.div variants={itemVariants}>
                        <DataTable
                            data={filteredAndSortedSemesters}
                            columns={columns}
                            loading={isLoading}
                            emptyMessage="No semesters found"
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

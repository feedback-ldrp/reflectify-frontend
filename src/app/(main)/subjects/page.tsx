// src/app/subjects/page.tsx
"use client";

import { useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { showToast } from "@/lib/toast";
import { StatCard } from "@/components/ui/StatCard";
import {
    useAllSubjects,
    useCreateSubject,
    useUpdateSubject,
    useSoftDeleteSubject,
} from "@/hooks/useSubjects"; // Importing from the provided hook file
import { useAllDepartments } from "@/hooks/useDepartments"; // To get departments for filter/dropdown
import { useAllSemesters } from "@/hooks/useSemesters"; // To get semesters for filter/dropdown
import {
    Book, // Icon for subjects
    RefreshCw,
    Plus,
    X,
    Search,
    Edit,
    Trash2,
    Loader,
    CheckIcon,
    BookCheckIcon,
    BookCopyIcon,
    BookAIcon,
} from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, Select } from "@/components/ui";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import {
    Subject,
    CreateSubjectData,
    UpdateSubjectData,
} from "@/interfaces/subject";
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

export default function SubjectManagement() {
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
    const [showAddSubjectCard, _setShowAddSubjectCard] = useState(false);
    const [editingSubject, _setEditingSubject] = useState<Subject | null>(null);
    const [deletingSubject, _setDeletingSubject] = useState<Subject | null>(
        null
    );

    // Helper function to manage card visibility and scroll
    const setShowAddSubjectCard = useCallback((show: boolean) => {
        _setShowAddSubjectCard(show);
        if (show) {
            _setEditingSubject(null);
            _setDeletingSubject(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const setEditingSubject = useCallback((subject: Subject | null) => {
        _setEditingSubject(subject);
        if (subject) {
            _setShowAddSubjectCard(false);
            _setDeletingSubject(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    const setDeletingSubject = useCallback((subject: Subject | null) => {
        _setDeletingSubject(subject);
        if (subject) {
            _setShowAddSubjectCard(false);
            _setEditingSubject(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, []);

    // Use the custom data hooks
    const {
        data: subjects = [],
        isLoading,
        isError,
        error,
        refetch: refetchSubjects,
    } = useAllSubjects();
    const { data: departments = [], isLoading: isLoadingDepartments } =
        useAllDepartments();
    const { data: semesters = [], isLoading: isLoadingSemesters } =
        useAllSemesters();

    // Calculate subject statistics locally
    const subjectStats = useMemo(() => {
        const totalSubjects = subjects.length;
        const mandatorySubjects = subjects.filter(
            (sub) => sub.type === "MANDATORY"
        ).length;
        const electiveSubjects = subjects.filter(
            (sub) => sub.type === "ELECTIVE"
        ).length;
        const totalSubjectAllocations = subjects.reduce(
            (acc, sub) => acc + (sub.allocations?.length || 0),
            0
        );

        return {
            totalSubjects,
            mandatorySubjects,
            electiveSubjects,
            totalSubjectAllocations,
        };
    }, [subjects]);

    // Initialize mutation hooks
    const createSubjectMutation = useCreateSubject();
    const updateSubjectMutation = useUpdateSubject();
    const softDeleteSubjectMutation = useSoftDeleteSubject();

    // Sync local state with hook state (for search and sort)
    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
    }, []);

    const handleSortOrderChange = useCallback((value: "asc" | "desc") => {
        setSortOrder(value);
    }, []);

    // New subject form state (for Add Subject Card)
    const [newSubject, setNewSubject] = useState<CreateSubjectData>({
        name: "",
        abbreviation: "",
        subjectCode: "",
        semesterId: "",
        departmentId: "",
        type: "MANDATORY", // Default to MANDATORY
    });

    // State for editing subject (for Edit Subject Card)
    const [currentEditSubject, setCurrentEditSubject] = useState<
        (UpdateSubjectData & { id: IdType }) | null
    >(null);

    // Filter and sort data locally
    const filteredAndSortedSubjects = useMemo(() => {
        let filtered = [...subjects];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(
                (sub) =>
                    sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    sub.subjectCode
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    sub.description
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    departments
                        .find((d) => d.id === sub.departmentId)
                        ?.name.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    semesters
                        .find((s) => s.id === sub.semesterId)
                        ?.semesterNumber.toString()
                        .includes(searchTerm.toLowerCase())
            );
        }

        // Apply department filter
        if (selectedDepartmentFilter) {
            filtered = filtered.filter(
                (sub) => sub.departmentId === selectedDepartmentFilter
            );
        }

        // Apply semester filter
        if (selectedSemesterFilter) {
            filtered = filtered.filter(
                (sub) => sub.semesterId === selectedSemesterFilter
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const aValue = a.name; // Default sort by name
            const bValue = b.name;

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
    }, [
        subjects,
        searchTerm,
        selectedDepartmentFilter,
        selectedSemesterFilter,
        sortOrder,
        departments,
        semesters,
    ]);

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

    const handleAddSubject = useCallback(async () => {
        if (
            !newSubject.name.trim() ||
            !newSubject.subjectCode.trim() ||
            !newSubject.semesterId ||
            !newSubject.departmentId
        ) {
            showToast.error(
                "Please fill in all required fields (Name, Code, Credits, Semester, Department)"
            );
            return;
        }

        const subjectData: CreateSubjectData = {
            name: newSubject.name,
            abbreviation: newSubject.abbreviation,
            subjectCode: newSubject.subjectCode,
            semesterId: newSubject.semesterId,
            departmentId: newSubject.departmentId,
            type: "MANDATORY",
        };

        try {
            await createSubjectMutation.mutateAsync(subjectData);
            showToast.success("Subject created!");
            setShowAddSubjectCard(false); // Close the add card
            // Reset newSubject state
            setNewSubject({
                name: "",
                abbreviation: "",
                subjectCode: "",
                semesterId: "",
                departmentId: "",
                type: "MANDATORY",
            });
        } catch (err: any) {
            showToast.error(err.message || "Failed to create subject");
        }
    }, [newSubject, createSubjectMutation, setShowAddSubjectCard]);

    const handleUpdateSubject = useCallback(async () => {
        if (!currentEditSubject || !currentEditSubject.id) {
            showToast.error("No subject selected for update.");
            return;
        }

        // Basic validation for required fields in the update form
        if (
            !currentEditSubject.name?.trim() ||
            !currentEditSubject.subjectCode?.trim() ||
            !currentEditSubject.semesterId ||
            !currentEditSubject.departmentId
        ) {
            showToast.error(
                "Please fill in all required fields for update (Name, Code, Credits, Semester, Department)"
            );
            return;
        }

        try {
            await updateSubjectMutation.mutateAsync({
                id: currentEditSubject.id,
                data: {
                    name: currentEditSubject.name,
                    subjectCode: currentEditSubject.subjectCode,
                    semesterId: currentEditSubject.semesterId,
                    departmentId: currentEditSubject.departmentId,
                    type: currentEditSubject.type ? "MANDATORY" : "ELECTIVE",
                },
            });
            showToast.success("Subject updated!");
            setEditingSubject(null); // Close the edit card
            setCurrentEditSubject(null); // Clear current edit state
        } catch (err: any) {
            showToast.error(err.message || "Failed to update subject");
        }
    }, [currentEditSubject, updateSubjectMutation, setEditingSubject]);

    const confirmDeleteSubject = useCallback(async () => {
        if (!deletingSubject) {
            showToast.error("No subject selected for deletion.");
            return;
        }
        try {
            await softDeleteSubjectMutation.mutateAsync(deletingSubject.id);
            showToast.success("Subject deleted!");
            setDeletingSubject(null); // Close the delete card
        } catch (err: any) {
            showToast.error(err.message || "Failed to delete subject");
        }
    }, [deletingSubject, softDeleteSubjectMutation, setDeletingSubject]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetchSubjects();
            showToast.success("Subject data refreshed!");
        } catch (err: any) {
            showToast.error(err.message || "Failed to refresh subject data.");
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchSubjects]);

    // Define DataTable columns
    const columns: DataTableColumn<Subject>[] = useMemo(
        () => [
            {
                key: "name",
                header: "Subject Name",
                sortable: true,
                accessor: (sub) => (
                    <span className="font-medium text-light-text dark:text-dark-text">
                        {sub.name}
                    </span>
                ),
            },
            {
                key: "abbreviation",
                header: "Abbreviation",
                sortable: true,
                accessor: (sub) => (
                    <span className="text-light-text dark:text-dark-text">
                        {sub.abbreviation}
                    </span>
                ),
            },
            {
                key: "subjectCode",
                header: "Subject Code",
                sortable: true,
                accessor: (sub) => (
                    <span className="text-light-text dark:text-dark-text">
                        {sub.subjectCode}
                    </span>
                ),
            },
            {
                key: "semester",
                header: "Semester",
                sortable: true,
                accessor: (sub) => {
                    const semester = semesters.find(
                        (s) => s.id === sub.semesterId
                    );
                    return (
                        <span className="text-light-text dark:text-dark-text">
                            {semester?.semesterNumber.toString() || "N/A"}
                        </span>
                    );
                },
            },
            {
                key: "department",
                header: "Department",
                sortable: true,
                accessor: (sub) => {
                    const department = departments.find(
                        (d) => d.id === sub.departmentId
                    );
                    return (
                        <span className="text-light-text dark:text-dark-text">
                            {department?.name || "N/A"}
                        </span>
                    );
                },
            },
            {
                key: "allocations",
                header: "Subject Allocations",
                sortable: true,
                accessor: (sub) => {
                    return (
                        <span className="text-light-text dark:text-dark-text">
                            {sub.allocations?.length || 0}
                        </span>
                    );
                },
            },
            {
                key: "subjectType",
                header: "Subject Type",
                sortable: true,
                accessor: (sub) => (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            sub.type == "ELECTIVE"
                                ? "bg-highlight1-light text-highlight1-darker dark:bg-highlight1-main/20 dark:text-highlight1-main"
                                : "text-highlight2-darker bg-highlight2-light  dark:bg-highlight2-main/20 dark:text-highlight2-main"
                        }`}
                    >
                        {sub.type}
                    </span>
                ),
            },
            {
                key: "actions",
                header: "Actions",
                accessor: (sub) => (
                    <div className="flex items-center justify-start gap-2">
                        <button
                            onClick={() => {
                                setEditingSubject(sub);
                                setCurrentEditSubject({
                                    id: sub.id,
                                    name: sub.name,
                                    subjectCode: sub.subjectCode,
                                    semesterId: sub.semesterId,
                                    departmentId: sub.departmentId,
                                    type: sub.type,
                                });
                            }}
                            className="flex text-sm py-1 px-3 items-center gap-1 bg-transparent border rounded-xl border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-secondary dark:hover:bg-dark-secondary"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>

                        <button
                            onClick={() => setDeletingSubject(sub)}
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
        [setEditingSubject, setDeletingSubject, departments, semesters]
    );

    if (isLoading || isLoadingDepartments || isLoadingSemesters) {
        return <PageLoader text="Loading Subjects" />;
    }

    // Display error if data fetch failed and there's no data to show
    if (isError && subjects.length === 0) {
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
                        Failed to load subject data
                    </h3>
                    <p className="text-light-muted-text dark:text-dark-muted-text mb-6">
                        {error?.message ||
                            "We encountered an error while fetching subject data. Please try again."}
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
                                    Subject Management
                                </h1>
                                <p className="text-base text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2">
                                    <Book className="h-6 w-6 text-positive-main" />
                                    Manage academic subjects and their details
                                </p>
                            </div>

                            {/* Right Section: Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-1.5 py-2.5 px-4 text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-xl hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
                                    title="Refresh Subject Data"
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
                                    onClick={() => setShowAddSubjectCard(true)}
                                    className="flex-1 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                             hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                             transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Plus className="h-5 w-5 border-light-text dark:border-dark-text" />
                                        <span className="flex items-center justify-center gap-2">
                                            Add Subject
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
                            title="Total Subjects"
                            value={subjectStats.totalSubjects}
                            icon={Book}
                            onClick={() => {
                                router.push("/subjects");
                            }} // No specific route for this stat
                        />
                        <StatCard
                            title="Mandatory Subjects"
                            value={subjectStats.mandatorySubjects}
                            icon={BookAIcon}
                            onClick={() => {
                                router.push("/subjects");
                            }} // No specific route for this stat
                        />
                        <StatCard
                            title="Elective Subjects"
                            value={subjectStats.electiveSubjects}
                            icon={BookCopyIcon}
                            onClick={() => {
                                router.push("/subjects");
                            }} // No specific route for this stat
                        />
                        <StatCard
                            title="Subject Allocations"
                            value={subjectStats.totalSubjectAllocations}
                            icon={BookCheckIcon}
                            onClick={() => {
                                showToast.error("Not Allowed");
                            }} // No specific route for this stat
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
                                    placeholder="Search by name, code, or description..."
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

                    {/* Subject Add Card */}
                    {showAddSubjectCard && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Add New Subject
                                </h3>
                                <div className="space-y-4 mb-4">
                                    <Input
                                        label="Subject Name"
                                        type="text"
                                        value={newSubject.name}
                                        onChange={(e) =>
                                            setNewSubject({
                                                ...newSubject,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="Enter subject name (e.g., Data Structures)"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <Input
                                        label="Subject Abbreviation"
                                        type="text"
                                        value={newSubject.abbreviation}
                                        onChange={(e) =>
                                            setNewSubject({
                                                ...newSubject,
                                                abbreviation: e.target.value,
                                            })
                                        }
                                        placeholder="Enter subject abbreviation (e.g., CS)"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <Input
                                        label="Subject Code"
                                        type="text"
                                        value={newSubject.subjectCode}
                                        onChange={(e) =>
                                            setNewSubject({
                                                ...newSubject,
                                                subjectCode: e.target.value,
                                            })
                                        }
                                        placeholder="Enter subject code (e.g., CS101)"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Department
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="new-subject-department"
                                                name="new-subject-department"
                                                value={newSubject.departmentId}
                                                onChange={(e) =>
                                                    setNewSubject({
                                                        ...newSubject,
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
                                                id="new-subject-semester"
                                                name="new-subject-semester"
                                                value={newSubject.semesterId}
                                                onChange={(e) =>
                                                    setNewSubject({
                                                        ...newSubject,
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
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Subject Type
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="new-subject-type"
                                                name="new-subject-type"
                                                value={newSubject.type}
                                                onChange={(e) =>
                                                    setNewSubject({
                                                        ...newSubject,
                                                        type: e.target.value,
                                                    })
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select Subject Type
                                                </option>
                                                <option value="MANDATORY">
                                                    Mandatory
                                                </option>
                                                <option value="ELECTIVE">
                                                    Elective
                                                </option>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setShowAddSubjectCard(false)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddSubject}
                                        disabled={
                                            createSubjectMutation.isPending ||
                                            !newSubject.name.trim() ||
                                            !newSubject.subjectCode.trim() ||
                                            !newSubject.semesterId ||
                                            !newSubject.departmentId
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {createSubjectMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {createSubjectMutation.isPending
                                            ? "Adding..."
                                            : "Add Subject"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Subject Edit Card */}
                    {editingSubject && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Edit Subject: {editingSubject.abbreviation}
                                    {" - "}
                                    {editingSubject.name}
                                </h3>
                                <div className="space-y-4 mb-4">
                                    <Input
                                        label="Subject Name"
                                        type="text"
                                        value={currentEditSubject?.name || ""}
                                        onChange={(e) =>
                                            setCurrentEditSubject((prev) => ({
                                                ...(prev as UpdateSubjectData & {
                                                    id: IdType;
                                                }),
                                                name: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter subject name (e.g., Data Structures)"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <Input
                                        label="Subject Code"
                                        type="text"
                                        value={
                                            currentEditSubject?.subjectCode ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            setCurrentEditSubject((prev) => ({
                                                ...(prev as UpdateSubjectData & {
                                                    id: IdType;
                                                }),
                                                subjectCode: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter subject code (e.g., CS101)"
                                        required
                                        className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Department
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="edit-subject-department"
                                                name="edit-subject-department"
                                                value={
                                                    currentEditSubject?.departmentId ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setCurrentEditSubject(
                                                        (prev) => ({
                                                            ...(prev as UpdateSubjectData & {
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
                                                id="edit-subject-semester"
                                                name="edit-subject-semester"
                                                value={
                                                    currentEditSubject?.semesterId ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setCurrentEditSubject(
                                                        (prev) => ({
                                                            ...(prev as UpdateSubjectData & {
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
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Subject Type
                                        </label>
                                        <div className="relative">
                                            <Select
                                                id="edit-subject-type"
                                                name="edit-subject-type"
                                                value={editingSubject.type}
                                                onChange={(e) =>
                                                    setEditingSubject({
                                                        ...editingSubject,
                                                        type: e.target.value,
                                                    })
                                                }
                                                required
                                            >
                                                <option value="">
                                                    Select Subject Type
                                                </option>
                                                <option value="MANDATORY">
                                                    Mandatory
                                                </option>
                                                <option value="ELECTIVE">
                                                    Elective
                                                </option>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() => setEditingSubject(null)}
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateSubject}
                                        disabled={
                                            updateSubjectMutation.isPending ||
                                            !currentEditSubject?.name?.trim() ||
                                            !currentEditSubject?.subjectCode?.trim() ||
                                            !currentEditSubject?.semesterId ||
                                            !currentEditSubject?.departmentId
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updateSubjectMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {updateSubjectMutation.isPending
                                            ? "Updating..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Subject Delete Card */}
                    {deletingSubject && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Confirm Deletion
                                </h3>
                                <p className="text-light-text dark:text-dark-text mb-6">
                                    Are you sure you want to delete subject{" "}
                                    <span className="font-semibold">
                                        {deletingSubject.abbreviation}
                                        {" - "}
                                        {deletingSubject.name} (
                                        {deletingSubject.subjectCode}) of
                                        Semester{" "}
                                        {
                                            deletingSubject.semester
                                                ?.semesterNumber
                                        }{" "}
                                        ({deletingSubject.department?.name}{" "}
                                        Department)
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() => setDeletingSubject(null)}
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text hover:shadow-lg dark:hover:shadow-gray-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteSubject}
                                        disabled={
                                            softDeleteSubjectMutation.isPending
                                        }
                                        className="text-sm flex items-center gap-2 bg-red-600 dark:bg-red-500 text-white py-2.5 px-4 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {softDeleteSubjectMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <Trash2 className="h-5 w-5" />
                                        )}
                                        {softDeleteSubjectMutation.isPending
                                            ? "Deleting..."
                                            : "Confirm Delete"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Subject Data Table */}
                    <motion.div variants={itemVariants}>
                        <DataTable
                            data={filteredAndSortedSubjects}
                            columns={columns}
                            loading={isLoading}
                            emptyMessage="No subjects found"
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

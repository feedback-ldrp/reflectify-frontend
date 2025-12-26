// src/app/faculty/page.tsx
"use client";

import { useCallback, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { showToast } from "@/lib/toast";
import { StatCard } from "@/components/ui/StatCard";
import { useFacultyData } from "@/hooks/faculty/useFacultyData";
import {
    useCreateFaculty,
    useUpdateFaculty,
    useSoftDeleteFaculty,
} from "@/hooks/faculty/useFaculties";
import {
    User,
    RefreshCw,
    Plus,
    X,
    Search,
    Edit,
    Trash2,
    Loader,
    CheckIcon,
    ChevronDownIcon,
} from "lucide-react";
import { BuildingOfficeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, Select } from "@/components/ui";
import { DataTable, DataTableColumn } from "@/components/ui/DataTable";
import {
    Faculty,
    CreateFacultyData,
    UpdateFacultyData,
} from "@/interfaces/faculty"; // Imported interfaces
import { IdType } from "@/interfaces/common";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import {
    Designation,
    designationDisplayMap,
    designationOptions,
} from "@/constants/designations";
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

export default function FacultyManagement() {
    const router = useRouter();

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState<IdType | "">(
        ""
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Card visibility states
    const [showAddFacultyCard, _setShowAddFacultyCard] = useState(false);
    const [editingFaculty, _setEditingFaculty] = useState<Faculty | null>(null);
    const [deletingFaculty, _setDeletingFaculty] = useState<Faculty | null>(
        null
    );

    // Helper function to manage card visibility and scroll
    const setShowAddFacultyCard = useCallback((show: boolean) => {
        _setShowAddFacultyCard(show);
        if (show) {
            _setEditingFaculty(null);
            _setDeletingFaculty(null);
            window.scrollTo({ top: 300, behavior: "smooth" });
        }
    }, []);

    const setEditingFaculty = useCallback((faculty: Faculty | null) => {
        _setEditingFaculty(faculty);
        if (faculty) {
            _setShowAddFacultyCard(false);
            _setDeletingFaculty(null);
            window.scrollTo({ top: 300, behavior: "smooth" });
        }
    }, []);

    const setDeletingFaculty = useCallback((faculty: Faculty | null) => {
        _setDeletingFaculty(faculty);
        if (faculty) {
            _setShowAddFacultyCard(false);
            _setEditingFaculty(null);
            window.scrollTo({ top: 300, behavior: "smooth" });
        }
    }, []);

    // Use the custom data hook
    const {
        faculty,
        departments,
        departmentStats,
        setSearchTerm: setHookSearchTerm,
        setSelectedDepartment: setHookSelectedDepartment,
        setSortOrder: setHookSortOrder,
        filteredAndSortedFaculty,
        isLoading,
        isError,
        error,
        refetchFaculty,
    } = useFacultyData();

    // Initialize mutation hooks
    const createFacultyMutation = useCreateFaculty();
    const updateFacultyMutation = useUpdateFaculty();
    const softDeleteFacultyMutation = useSoftDeleteFaculty();

    // Sync local state with hook state
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchTerm(value);
            setHookSearchTerm(value);
        },
        [setHookSearchTerm]
    );

    const handleDepartmentChange = useCallback(
        (value: IdType | "") => {
            setSelectedDepartment(value);
            setHookSelectedDepartment(value);
        },
        [setHookSelectedDepartment]
    );

    const handleSortOrderChange = useCallback(
        (value: "asc" | "desc") => {
            setSortOrder(value);
            setHookSortOrder(value);
        },
        [setHookSortOrder]
    );

    // New faculty form state (for Add Faculty Card)
    const [newFaculty, setNewFaculty] = useState<CreateFacultyData>({
        name: "",
        abbreviation: "", // Abbreviation is required in CreateFacultyData
        email: "",
        designation: "AsstProf", // Default designation
        departmentId: "",
        seatingLocation: "", // Optional in CreateFacultyData, can be empty string
        joiningDate: "", // Optional in CreateFacultyData, can be empty string
    });

    // State for editing faculty (for Edit Faculty Card)
    const [currentEditFaculty, setCurrentEditFaculty] = useState<
        (UpdateFacultyData & { id: string }) | null
    >(null);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setSearchTerm("");
        setSelectedDepartment("");
        setSortOrder("asc");
        setHookSearchTerm("");
        setHookSelectedDepartment("");
        setHookSortOrder("asc");
    }, [setHookSearchTerm, setHookSelectedDepartment, setHookSortOrder]);

    // Check if any filters are active
    const hasActiveFilters =
        searchTerm !== "" || selectedDepartment !== "" || sortOrder !== "asc";

    const handleAddFaculty = useCallback(async () => {
        // Validate required fields based on CreateFacultyData interface
        if (
            !newFaculty.name.trim() ||
            !newFaculty.email.trim() ||
            !newFaculty.abbreviation.trim() || // Abbreviation is now required
            !newFaculty.departmentId ||
            (newFaculty.seatingLocation !== undefined &&
                !newFaculty.seatingLocation.trim()) // Seating location is optional
        ) {
            showToast.error("Please fill in all required fields");
            return;
        }

        const facultyData: CreateFacultyData = {
            name: newFaculty.name,
            abbreviation: newFaculty.abbreviation, // Directly assign as it's a required string
            email: newFaculty.email,
            designation: newFaculty.designation,
            departmentId: newFaculty.departmentId,
            seatingLocation: newFaculty.seatingLocation || undefined, // Pass undefined if empty for optional field
            joiningDate: newFaculty.joiningDate || undefined, // Pass undefined if empty for optional field
        };

        try {
            await createFacultyMutation.mutateAsync(facultyData);
            showToast.success("Faculty created!");
            setShowAddFacultyCard(false); // Close the add card
            // Reset newFaculty state
            setNewFaculty({
                name: "",
                abbreviation: "",
                email: "",
                designation: "AsstProf",
                departmentId: "",
                seatingLocation: "",
                joiningDate: "",
            });
        } catch (err: any) {
            showToast.error(err.message || "Failed to create faculty");
        }
    }, [newFaculty, createFacultyMutation, setShowAddFacultyCard]);

    const handleUpdateFaculty = useCallback(async () => {
        if (!currentEditFaculty || !currentEditFaculty.id) {
            showToast.error("No faculty selected for update.");
            return;
        }

        // Basic validation for required fields in the update form
        if (
            !currentEditFaculty.name?.trim() ||
            !currentEditFaculty.email?.trim() ||
            !currentEditFaculty.departmentId ||
            (currentEditFaculty.seatingLocation !== undefined &&
                !currentEditFaculty.seatingLocation.trim())
        ) {
            showToast.error("Please fill in all required fields for update");
            return;
        }

        try {
            await updateFacultyMutation.mutateAsync({
                id: currentEditFaculty.id,
                data: {
                    name: currentEditFaculty.name,
                    abbreviation: currentEditFaculty.abbreviation || undefined, // Abbreviation is optional in UpdateFacultyData
                    email: currentEditFaculty.email,
                    designation: currentEditFaculty.designation, // Designation is required in UpdateFacultyData
                    seatingLocation:
                        currentEditFaculty.seatingLocation || undefined, // Seating location is optional
                    joiningDate: currentEditFaculty.joiningDate || undefined, // Joining date is optional
                    departmentId: currentEditFaculty.departmentId,
                },
            });
            showToast.success("Faculty updated!");
            setEditingFaculty(null); // Close the edit card
            setCurrentEditFaculty(null); // Clear current edit state
        } catch (err: any) {
            showToast.error(err.message || "Failed to update faculty");
        }
    }, [currentEditFaculty, updateFacultyMutation, setEditingFaculty]);

    const confirmDeleteFaculty = useCallback(async () => {
        if (!deletingFaculty) {
            showToast.error("No faculty selected for deletion.");
            return;
        }
        try {
            await softDeleteFacultyMutation.mutateAsync(deletingFaculty.id);
            showToast.success("Faculty deleted!");
            setDeletingFaculty(null); // Close the delete card
        } catch (err: any) {
            showToast.error(err.message || "Failed to delete faculty");
        }
    }, [deletingFaculty, softDeleteFacultyMutation, setDeletingFaculty]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refetchFaculty();
            showToast.success("Faculty data refreshed!");
        } catch (err: any) {
            showToast.error(err.message || "Failed to refresh faculty data.");
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchFaculty]);

    // Define DataTable columns
    const columns: DataTableColumn<Faculty>[] = useMemo(
        () => [
            {
                key: "name",
                header: "Name",
                sortable: true,
                accessor: (faculty) => (
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="font-medium text-light-text dark:text-dark-text">
                                {faculty.name}
                            </div>
                            <div className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                {faculty.email}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                key: "abbreviation",
                header: "Abbreviation",
                sortable: true,
                // align: "center",
                accessor: (faculty) => (
                    <span className="text-light-text dark:text-dark-text">
                        {faculty.abbreviation || "N/A"}
                    </span>
                ),
            },
            {
                key: "designation",
                header: "Designation",
                sortable: true,
                accessor: (faculty) => (
                    <span className="text-light-text dark:text-dark-text">
                        {designationDisplayMap[faculty.designation] || "N/A"}
                    </span>
                ),
            },
            {
                key: "department",
                header: "Department",
                sortable: true,
                accessor: (faculty) => (
                    <span className="text-light-text dark:text-dark-text">
                        {faculty.department?.name || "N/A"}
                    </span>
                ),
            },
            {
                key: "joiningDate",
                header: "Joining Date",
                sortable: true,
                accessor: (faculty) => {
                    if (!faculty.joiningDate) return "N/A";
                    const date = new Date(faculty.joiningDate);
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const year = date.getFullYear();
                    return `${day}${" "}/${" "}${month}${" "}/${" "}${year}`;
                },
            },
            {
                key: "actions",
                header: "Actions",
                // align: "center",
                accessor: (faculty) => (
                    <div className="flex items-center justify-start gap-2">
                        <button
                            onClick={() => {
                                setEditingFaculty(faculty);
                                setCurrentEditFaculty({
                                    id: faculty.id,
                                    name: faculty.name,
                                    abbreviation: faculty.abbreviation || "",
                                    email: faculty.email,
                                    designation:
                                        faculty.designation as Designation,
                                    seatingLocation:
                                        faculty.seatingLocation || "",
                                    joiningDate: faculty.joiningDate || "",
                                    departmentId: faculty.department?.id || "",
                                });
                            }}
                            className="flex text-sm py-1 px-3 items-center gap-1 bg-transparent border rounded-xl border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light-secondary dark:hover:bg-dark-secondary"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>

                        <button
                            onClick={() => setDeletingFaculty(faculty)}
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
        [setEditingFaculty, setCurrentEditFaculty, setDeletingFaculty]
    );

    if (isLoading) {
        return <PageLoader text="Loading Faculties" />;
    }

    // Display error if data fetch failed and there's no data to show
    if (isError && faculty.length === 0) {
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
                        Failed to load faculty data
                    </h3>
                    <p className="text-light-muted-text dark:text-dark-muted-text mb-6">
                        {error?.message ||
                            "We encountered an error while fetching faculty data. Please try again."}
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
                                    Faculty Management
                                </h1>
                                <p className="text-base text-light-muted-text dark:text-dark-muted-text flex items-center gap-2 mt-2">
                                    <User className="h-6 w-6 text-positive-main" />
                                    Manage faculty members and their information
                                </p>
                            </div>

                            {/* Right Section: Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    onClick={handleRefresh}
                                    className="flex items-center gap-1.5 py-2.5 px-4 text-light-text dark:text-dark-text bg-light-secondary dark:bg-dark-secondary rounded-xl hover:bg-light-hover hover:dark:bg-dark-hover transition-colors"
                                    title="Refresh Faculty Data"
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
                                    onClick={() => setShowAddFacultyCard(true)}
                                    className="flex-1 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                             hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                             transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Plus className="h-5 w-5 border-light-text dark:border-dark-text" />
                                        <span className="flex items-center justify-center gap-2">
                                            Add Faculty
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
                            title="Total Faculty"
                            value={faculty.length}
                            icon={User}
                            onClick={() => router.push("/faculties")}
                        />
                        {departmentStats.map((stat) => (
                            <StatCard
                                key={stat.departmentName}
                                title={stat.departmentName}
                                value={stat.count}
                                icon={BuildingOfficeIcon}
                                onClick={() => router.push("/departments")}
                            />
                        ))}
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
                                    placeholder="Search by name, email, employee ID, or department..."
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
                                        ? "Sort: A to Z"
                                        : "Sort: Z to A"}
                                </button>
                                {/* Department Filter */}
                                <Select
                                    id="department-select"
                                    name="department-select"
                                    value={selectedDepartment}
                                    onChange={(e) =>
                                        handleDepartmentChange(e.target.value)
                                    }
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
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

                    {/* Faculty Add Card */}
                    {showAddFacultyCard && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Add New Faculty
                                </h3>
                                <div className="flex flex-col md:flex-row items-start justify-center gap-4 mb-4">
                                    <div className="flex-1 space-y-4 w-full">
                                        <Input
                                            label="Name"
                                            value={newFaculty.name}
                                            onChange={(e) =>
                                                setNewFaculty({
                                                    ...newFaculty,
                                                    name: e.target.value,
                                                })
                                            }
                                            placeholder="Enter name"
                                            required
                                            className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="Email"
                                                type="email"
                                                value={newFaculty.email}
                                                onChange={(e) =>
                                                    setNewFaculty({
                                                        ...newFaculty,
                                                        email: e.target.value,
                                                    })
                                                }
                                                placeholder="Enter email address"
                                                required
                                                className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            <Input
                                                label="Abbreviation"
                                                value={newFaculty.abbreviation}
                                                onChange={(e) =>
                                                    setNewFaculty({
                                                        ...newFaculty,
                                                        abbreviation:
                                                            e.target.value,
                                                    })
                                                }
                                                placeholder="Enter abbreviation"
                                                required // Now required
                                                className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                                    Department
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={
                                                            newFaculty.departmentId
                                                        }
                                                        onChange={(e) =>
                                                            setNewFaculty({
                                                                ...newFaculty,
                                                                departmentId: e
                                                                    .target
                                                                    .value as IdType,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent appearance-none text-sm"
                                                        required
                                                        aria-label="Select Department"
                                                    >
                                                        <option value="">
                                                            Select Department
                                                        </option>
                                                        {departments.map(
                                                            (dept) => (
                                                                <option
                                                                    key={
                                                                        dept.id
                                                                    }
                                                                    value={
                                                                        dept.id
                                                                    }
                                                                >
                                                                    {dept.name}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                    <ChevronDownIcon className="h-5 w-5 text-light-tertiary dark:text-dark-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                                    Designation
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={
                                                            newFaculty.designation
                                                        }
                                                        onChange={(e) =>
                                                            setNewFaculty({
                                                                ...newFaculty,
                                                                designation: e
                                                                    .target
                                                                    .value as Designation,
                                                            })
                                                        }
                                                        className="w-full px-3 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent appearance-none text-sm"
                                                        required
                                                        aria-label="Select Designation"
                                                    >
                                                        {designationOptions.map(
                                                            (option) => (
                                                                <option
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                    <ChevronDownIcon className="h-5 w-5 text-light-tertiary dark:text-dark-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <Input
                                            label="Seating Location"
                                            value={
                                                newFaculty.seatingLocation || ""
                                            }
                                            onChange={(e) =>
                                                setNewFaculty({
                                                    ...newFaculty,
                                                    seatingLocation:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Enter seating location"
                                            className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Joining Date
                                        </label>
                                        <DayPicker
                                            animate
                                            mode="single"
                                            selected={
                                                newFaculty.joiningDate
                                                    ? new Date(
                                                          newFaculty.joiningDate
                                                      )
                                                    : undefined
                                            }
                                            onSelect={(date) =>
                                                setNewFaculty({
                                                    ...newFaculty,
                                                    joiningDate: date
                                                        ? date.toISOString()
                                                        : "",
                                                })
                                            }
                                            navLayout="around"
                                            required
                                            className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background "
                                            classNames={{
                                                selected: `text-white p-1`,
                                                day: `hover:bg-light-hover hover:text-light-text dark:hover:text-dark-text dark:hover:bg-dark-hover p-1`,
                                                today: `font-bold text-primary-dark`,
                                                range_start:
                                                    "bg-light-highlight dark:bg-dark-highlight text-primary-dark dark:text-primary-lighter rounded-l-xl",
                                                range_middle: `bg-primary-main/60 dark:bg-primary-darker/60 text-light-text dark:text-dark-text`,
                                                range_end:
                                                    "bg-light-highlight dark:bg-dark-highlight text-primary-dark dark:text-primary-lighter rounded-r-xl",
                                                nav_button:
                                                    "text-light-highlight dark:text-dark-highlight",
                                            }}
                                            styles={{
                                                caption: { color: "#f97316" },
                                                day_selected: {
                                                    accentColor: "#f97316",
                                                    color: "black",
                                                },
                                                day_range_middle: {
                                                    accentColor: "#f97316",
                                                    color: "#f97316",
                                                    borderRadius: "0.5rem",
                                                },
                                                day_today: {
                                                    color: "#f97316",
                                                },
                                                nav_button: {
                                                    color: "#f97316",
                                                },
                                                nav_button_next: {
                                                    color: "#f97316",
                                                },
                                                nav_button_previous: {
                                                    color: "#f97316",
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() =>
                                            setShowAddFacultyCard(false)
                                        }
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddFaculty}
                                        disabled={
                                            createFacultyMutation.isPending ||
                                            !newFaculty.name.trim() ||
                                            !newFaculty.email.trim() ||
                                            !newFaculty.abbreviation.trim() || // Abbreviation is now required
                                            !newFaculty.departmentId ||
                                            (newFaculty.seatingLocation !==
                                                undefined &&
                                                !newFaculty.seatingLocation.trim())
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {createFacultyMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {createFacultyMutation.isPending
                                            ? "Adding..."
                                            : "Add Faculty"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Faculty Edit Card */}
                    {editingFaculty && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Edit Faculty: {editingFaculty.name}
                                </h3>
                                <div className="flex flex-col md:flex-row items-start justify-center gap-4 mb-4">
                                    <div className="flex-1 space-y-4 w-full">
                                        <Input
                                            label="Name"
                                            value={
                                                currentEditFaculty?.name || ""
                                            }
                                            onChange={(e) =>
                                                setCurrentEditFaculty(
                                                    (prev) => ({
                                                        ...(prev as UpdateFacultyData & {
                                                            id: string;
                                                        }),
                                                        name: e.target.value,
                                                    })
                                                )
                                            }
                                            placeholder="Enter name"
                                            required
                                            className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="Email"
                                                type="email"
                                                value={
                                                    currentEditFaculty?.email ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setCurrentEditFaculty(
                                                        (prev) => ({
                                                            ...(prev as UpdateFacultyData & {
                                                                id: string;
                                                            }),
                                                            email: e.target
                                                                .value,
                                                        })
                                                    )
                                                }
                                                placeholder="Enter email address"
                                                required
                                                className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                            <Input
                                                label="Abbreviation"
                                                value={
                                                    currentEditFaculty?.abbreviation ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    setCurrentEditFaculty(
                                                        (prev) => ({
                                                            ...(prev as UpdateFacultyData & {
                                                                id: string;
                                                            }),
                                                            abbreviation:
                                                                e.target.value,
                                                        })
                                                    )
                                                }
                                                placeholder="Enter abbreviation"
                                                className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                                    Department
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={
                                                            currentEditFaculty?.departmentId ||
                                                            ""
                                                        }
                                                        onChange={(e) =>
                                                            setCurrentEditFaculty(
                                                                (prev) => ({
                                                                    ...(prev as UpdateFacultyData & {
                                                                        id: string;
                                                                    }),
                                                                    departmentId:
                                                                        e.target
                                                                            .value as IdType,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent appearance-none text-sm"
                                                        required
                                                        aria-label="Select Department"
                                                    >
                                                        <option value="">
                                                            Select Department
                                                        </option>
                                                        {departments.map(
                                                            (dept) => (
                                                                <option
                                                                    key={
                                                                        dept.id
                                                                    }
                                                                    value={
                                                                        dept.id
                                                                    }
                                                                >
                                                                    {dept.name}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                    <ChevronDownIcon className="h-5 w-5 text-light-tertiary dark:text-dark-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                                    Designation
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={
                                                            currentEditFaculty?.designation ||
                                                            "AsstProf"
                                                        }
                                                        onChange={(e) =>
                                                            setCurrentEditFaculty(
                                                                (prev) => ({
                                                                    ...(prev as UpdateFacultyData & {
                                                                        id: string;
                                                                    }),
                                                                    designation:
                                                                        e.target
                                                                            .value as Designation,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent appearance-none text-sm"
                                                        required
                                                        aria-label="Select Designation"
                                                    >
                                                        {designationOptions.map(
                                                            (option) => (
                                                                <option
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                    <ChevronDownIcon className="h-5 w-5 text-light-tertiary dark:text-dark-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <Input
                                            label="Seating Location"
                                            value={
                                                currentEditFaculty?.seatingLocation ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                setCurrentEditFaculty(
                                                    (prev) => ({
                                                        ...(prev as UpdateFacultyData & {
                                                            id: string;
                                                        }),
                                                        seatingLocation:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                            placeholder="Enter seating location"
                                            className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                            Joining Date
                                        </label>
                                        <DayPicker
                                            animate
                                            mode="single"
                                            selected={
                                                currentEditFaculty?.joiningDate
                                                    ? new Date(
                                                          currentEditFaculty.joiningDate
                                                      )
                                                    : undefined
                                            }
                                            onSelect={(date) =>
                                                setCurrentEditFaculty(
                                                    (prev) => ({
                                                        ...(prev as UpdateFacultyData & {
                                                            id: string;
                                                        }),
                                                        joiningDate: date
                                                            ? date.toISOString()
                                                            : "",
                                                    })
                                                )
                                            }
                                            navLayout="around"
                                            required
                                            className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background "
                                            classNames={{
                                                selected: `text-white p-1`,
                                                day: `hover:bg-light-hover hover:text-light-text dark:hover:text-dark-text dark:hover:bg-dark-hover p-1`,
                                                today: `font-bold text-primary-dark`,
                                                range_start:
                                                    "bg-light-highlight dark:bg-dark-highlight text-primary-dark dark:text-primary-lighter rounded-l-xl",
                                                range_middle: `bg-primary-main/60 dark:bg-primary-darker/60 text-light-text dark:text-dark-text`,
                                                range_end:
                                                    "bg-light-highlight dark:bg-dark-highlight text-primary-dark dark:text-primary-lighter rounded-r-xl",
                                                nav_button:
                                                    "text-light-highlight dark:text-dark-highlight",
                                            }}
                                            styles={{
                                                caption: { color: "#f97316" },
                                                day_selected: {
                                                    accentColor: "#f97316",
                                                    color: "black",
                                                },
                                                day_range_middle: {
                                                    accentColor: "#f97316",
                                                    color: "#f97316",
                                                    borderRadius: "0.5rem",
                                                },
                                                day_today: {
                                                    color: "#f97316",
                                                },
                                                nav_button: {
                                                    color: "#f97316",
                                                },
                                                nav_button_next: {
                                                    color: "#f97316",
                                                },
                                                nav_button_previous: {
                                                    color: "#f97316",
                                                },
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() => setEditingFaculty(null)}
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateFaculty}
                                        disabled={
                                            updateFacultyMutation.isPending ||
                                            !currentEditFaculty?.name?.trim() ||
                                            !currentEditFaculty?.email?.trim() ||
                                            !currentEditFaculty?.departmentId ||
                                            (currentEditFaculty.seatingLocation !==
                                                undefined &&
                                                !currentEditFaculty.seatingLocation.trim())
                                        }
                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {updateFacultyMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <CheckIcon className="h-5 w-5" />
                                        )}
                                        {updateFacultyMutation.isPending
                                            ? "Updating..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Faculty Delete Card */}
                    {deletingFaculty && (
                        <motion.div variants={itemVariants}>
                            <Card className="hover:shadow-lg transition-shadow p-6 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-2xl bg-light-background">
                                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                    Confirm Deletion
                                </h3>
                                <p className="text-light-text dark:text-dark-text mb-6">
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold">
                                        {deletingFaculty.name}
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                                <div className="flex w-full items-center justify-end gap-3">
                                    <button
                                        onClick={() => setDeletingFaculty(null)}
                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-light-secondary dark:border-dark-secondary text-light-text dark:text-dark-text hover:shadow-lg dark:hover:shadow-gray-700/20"
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDeleteFaculty}
                                        disabled={
                                            softDeleteFacultyMutation.isPending
                                        }
                                        className="text-sm flex items-center gap-2 bg-red-600 dark:bg-red-500 text-white py-2.5 px-4 rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {softDeleteFacultyMutation.isPending ? (
                                            <Loader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <Trash2 className="h-5 w-5" />
                                        )}
                                        {softDeleteFacultyMutation.isPending
                                            ? "Deleting..."
                                            : "Confirm Delete"}
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Faculty Data Table */}
                    <motion.div variants={itemVariants}>
                        <DataTable
                            showserial={true}
                            data={filteredAndSortedFaculty}
                            columns={columns}
                            loading={isLoading}
                            emptyMessage="No faculty members found"
                            pageSize={15}
                            showPagination={true}
                            showSearch={false}
                            className="bg-light-background dark:bg-dark-muted-background"
                            showCard={true}
                            stickyHeader={true}
                            maxHeight="800px"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

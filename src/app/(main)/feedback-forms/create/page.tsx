// src/app/(main)/feedback-forms/create/page.tsx
"use client";

import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    EyeIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";

// Utilities and Hooks
import { showToast } from "@/lib/toast";
import { useAllAcademicYears } from "@/hooks/useAcademicYears";

// UI Components
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/common/Loader";
import { Select } from "@/components/ui";
import { PageLoader } from "@/components/ui/LoadingSpinner";

// Services
import feedbackFormService from "@/services/feedbackFormService";
import academicStructureService from "@/services/academicStructure.service";

// Interfaces
import type {
    AcademicSemester,
    AcademicDivision,
    DepartmentWithAcademicStructure,
} from "@/interfaces/academicStructure";
import { GenerateFormsData } from "@/interfaces/feedbackForm";

export const dynamic = "force-dynamic";

interface SemesterSelection {
    selected: boolean;
    indeterminate: boolean;
    divisions: string[];
}

interface SelectionState {
    departmentId: string;
    academicYearId: string;
    semesterSelections: {
        [semesterId: string]: SemesterSelection;
    };
}

// --- Preview Modal Component ---
interface PreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    selection: SelectionState;
    academicStructure: DepartmentWithAcademicStructure[];
    onGenerate: () => void;
    loading: boolean;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
    isOpen,
    onClose,
    selection,
    academicStructure,
    onGenerate,
    loading,
}) => {
    // Memoize the selected department to avoid re-calculation on every render
    const selectedDepartment = useMemo(
        () => academicStructure.find((d) => d.id === selection.departmentId),
        [academicStructure, selection.departmentId]
    );

    // Memoize the selected semesters for rendering
    const semestersToDisplay = useMemo(() => {
        return Object.entries(selection.semesterSelections)
            .filter(([, value]) => value.divisions.length > 0)
            .map(([semId, value]) => {
                const semester = academicStructure
                    .flatMap((d) => d.semesters)
                    .find((s) => s.id === semId);
                return { semId, value, semester };
            })
            .filter((item) => item.semester); // Ensure semester is found
    }, [selection.semesterSelections, academicStructure]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-light-background dark:bg-dark-background rounded-2xl max-w-2xl w-full overflow-y-auto mx-4 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <EyeIcon className="h-6 w-6 text-light-text dark:text-dark-text" />
                        <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text">
                            Selection Preview
                        </h2>
                    </div>
                    <button
                        type="button"
                        aria-label="Close preview"
                        onClick={onClose}
                        className="p-2 bg-transparent rounded-full hover:bg-light-hover dark:hover:bg-dark-hover transition-colors"
                    >
                        <XMarkIcon className="h-6 w-6 text-light-text dark:text-dark-text" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-light-text dark:text-dark-text text-lg">
                            Selected Department
                        </h3>
                        <p className="text-light-muted-text dark:text-dark-muted-text mt-1">
                            {selectedDepartment?.name || (
                                <span className="italic">None</span>
                            )}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-light-text dark:text-dark-text text-lg">
                            Selected Semesters and Divisions
                        </h3>
                        <div className="mt-3 space-y-4">
                            {semestersToDisplay.length > 0 ? (
                                semestersToDisplay.map(
                                    ({ semId, value, semester }) => (
                                        <div
                                            key={semId}
                                            className="bg-light-muted-background dark:bg-dark-muted-background p-4 rounded-lg shadow-sm"
                                        >
                                            <div className="font-medium text-light-text dark:text-dark-text text-base">
                                                {semester?.semesterNumber
                                                    ? `Semester ${semester.semesterNumber}`
                                                    : "Semester"}{" "}
                                                {semester?.academicYear
                                                    ?.yearString
                                                    ? `(${semester.academicYear.yearString})`
                                                    : ""}
                                            </div>
                                            <div className="text-light-muted-text dark:text-dark-muted-text text-sm mt-1">
                                                Divisions Selected:{" "}
                                                <span className="font-semibold">
                                                    {value.divisions.length}
                                                </span>{" "}
                                                of{" "}
                                                <span className="font-semibold">
                                                    {semester?.divisions.length}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {semester?.divisions
                                                    .filter((div) =>
                                                        value.divisions.includes(
                                                            div.id
                                                        )
                                                    )
                                                    .map((div) => (
                                                        <span
                                                            key={div.id}
                                                            className="px-3 py-1.5 bg-primary/10 text-primary-text dark:text-primary-text rounded-full text-xs font-medium"
                                                        >
                                                            {div.divisionName}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )
                                )
                            ) : (
                                <div className="text-light-muted-text dark:text-dark-muted-text italic py-2 text-center">
                                    No semesters/divisions selected.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-light-secondary dark:border-dark-secondary">
                    <Button
                        onClick={onGenerate}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2"
                        variant="default"
                    >
                        {loading ? (
                            <>
                                <Loader size="18" /> Generating...
                            </>
                        ) : (
                            "Generate Forms"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function CreateFeedbackForm() {
    const router = useRouter();
    const { data: academicYears = [], isLoading: isLoadingAcademicYears } =
        useAllAcademicYears();

    const [academicStructure, setAcademicStructure] = useState<
        DepartmentWithAcademicStructure[]
    >([]);
    const [selection, setSelection] = useState<SelectionState>({
        departmentId: "",
        academicYearId: "",
        semesterSelections: {},
    });
    const [showSelectionPreview, setShowSelectionPreview] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoadingStructure, setIsLoadingStructure] = useState(true);
    const [expandedDepts, setExpandedDepts] = useState<string[]>([]);
    const [expandedSems, setExpandedSems] = useState<string[]>([]);

    const [selectedAcademicYearId, setSelectedAcademicYearId] =
        useState<string>("");

    // Fetch Academic Structure based on selected year
    const fetchAcademicStructure = useCallback(
        async (yearId: string) => {
            setIsLoadingStructure(true);
            try {
                const structure =
                    await academicStructureService.getAcademicStructureByYear(
                        yearId
                    );

                // Sort the academic structure for consistent display
                const sortedStructure = structure
                    .sort((a, b) => a.name.localeCompare(b.name)) // Sort departments by name
                    .map((dept) => ({
                        ...dept,
                        semesters: dept.semesters
                            .sort((a, b) => {
                                // Sort semesters: first by academic year (descending), then by semester number (ascending)
                                const yearComparison =
                                    b.academicYear.yearString.localeCompare(
                                        a.academicYear.yearString
                                    );
                                if (yearComparison !== 0) return yearComparison;
                                return a.semesterNumber - b.semesterNumber;
                            })
                            .map((sem) => ({
                                ...sem,
                                divisions: sem.divisions.sort((a, b) =>
                                    a.divisionName.localeCompare(b.divisionName)
                                ), // Sort divisions by name
                            })),
                    }));

                setAcademicStructure(sortedStructure);
            } catch (error) {
                showToast.error("Failed to load academic structure: " + error);
            } finally {
                setIsLoadingStructure(false);
            }
        },
        [] // No dependencies, as it's a utility function
    );

    // Effect to set default academic year and fetch initial structure
    useEffect(() => {
        if (academicYears.length > 0 && !selectedAcademicYearId) {
            const activeYear = academicYears.find((year) => year.isActive);
            const defaultYear = activeYear || academicYears[0];
            setSelectedAcademicYearId(defaultYear.id);
            setSelection((prev) => ({
                ...prev,
                academicYearId: defaultYear.id,
            }));
            fetchAcademicStructure(defaultYear.id); // Fetch structure for the default year
        }
    }, [academicYears, selectedAcademicYearId, fetchAcademicStructure]);

    // Effect to refetch structure when academic year changes from selector
    useEffect(() => {
        if (
            selectedAcademicYearId &&
            selection.academicYearId !== selectedAcademicYearId
        ) {
            fetchAcademicStructure(selectedAcademicYearId);
            // Reset department and semester selections when academic year changes
            setSelection({
                departmentId: "",
                academicYearId: selectedAcademicYearId,
                semesterSelections: {},
            });
            // Collapse all expanded sections
            setExpandedDepts([]);
            setExpandedSems([]);
        }
    }, [
        selectedAcademicYearId,
        fetchAcademicStructure,
        selection.academicYearId,
    ]);

    const handleAcademicYearChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedAcademicYearId(e.target.value);
        },
        []
    );

    const handleDepartmentSelect = useCallback((deptId: string) => {
        setSelection((prev) => ({
            ...prev,
            departmentId: prev.departmentId === deptId ? "" : deptId,
            semesterSelections:
                prev.departmentId === deptId ? {} : prev.semesterSelections, // Clear semesters if department is unselected
        }));
        setExpandedDepts((prev) =>
            prev.includes(deptId)
                ? prev // Keep expanded if already expanded and re-selected
                : [...prev, deptId]
        ); // Expand department if newly selected
    }, []);

    const handleSemesterSelect = useCallback(
        (semId: string, divisions: AcademicDivision[]) => {
            setSelection((prev) => {
                const currentSemSelection = prev.semesterSelections[semId];
                const allDivisionIds = divisions.map((d) => d.id);
                const isCurrentlySelected = currentSemSelection?.selected;

                return {
                    ...prev,
                    semesterSelections: {
                        ...prev.semesterSelections,
                        [semId]: {
                            selected: !isCurrentlySelected,
                            indeterminate: false,
                            divisions: isCurrentlySelected
                                ? []
                                : allDivisionIds,
                        },
                    },
                };
            });
        },
        []
    );

    const handleDivisionSelect = useCallback(
        (semId: string, divId: string, allDivisions: AcademicDivision[]) => {
            setSelection((prev) => {
                const currentSemSelection = prev.semesterSelections[semId] || {
                    selected: false,
                    indeterminate: false,
                    divisions: [],
                };

                const newDivisions = currentSemSelection.divisions.includes(
                    divId
                )
                    ? currentSemSelection.divisions.filter((id) => id !== divId)
                    : [...currentSemSelection.divisions, divId];

                const allDivisionIds = allDivisions.map((d) => d.id);
                const isAllSelected =
                    newDivisions.length === allDivisionIds.length &&
                    allDivisionIds.every((id) => newDivisions.includes(id));
                const isPartiallySelected =
                    newDivisions.length > 0 && !isAllSelected;

                return {
                    ...prev,
                    semesterSelections: {
                        ...prev.semesterSelections,
                        [semId]: {
                            selected: isAllSelected,
                            indeterminate: isPartiallySelected,
                            divisions: newDivisions,
                        },
                    },
                };
            });
        },
        []
    );

    const toggleDepartmentExpansion = useCallback((deptId: string) => {
        setExpandedDepts((prev) =>
            prev.includes(deptId)
                ? prev.filter((id) => id !== deptId)
                : [...prev, deptId]
        );
    }, []);

    const toggleSemesterExpansion = useCallback((semesterId: string) => {
        setExpandedSems((prev) =>
            prev.includes(semesterId)
                ? prev.filter((id) => id !== semesterId)
                : [...prev, semesterId]
        );
    }, []);

    const handlePreviewSelection = useCallback(() => {
        if (!selection.departmentId) {
            showToast.error("Please select a department.");
            return;
        }
        const selectedSemestersCount = Object.values(
            selection.semesterSelections
        ).filter((sem) => sem.divisions.length > 0).length;

        if (selectedSemestersCount === 0) {
            showToast.error(
                "Please select at least one semester and its divisions."
            );
            return;
        }
        setShowSelectionPreview(true);
    }, [selection]);

    const handleGenerateForms = useCallback(async () => {
        setLoading(true);
        try {
            const formData: GenerateFormsData = {
                departmentId: selection.departmentId,
                selectedSemesters: Object.entries(selection.semesterSelections)
                    .filter(([, value]) => value.divisions.length > 0)
                    .map(([semesterId, value]) => ({
                        id: semesterId,
                        divisions: value.divisions,
                    })),
            };

            const generatedForms = await feedbackFormService.generateForms(
                formData
            );

            showToast.success(
                `Successfully generated ${generatedForms.length} feedback forms!`
            );
            setShowSelectionPreview(false);
            // Reset selection after successful generation
            setSelection({
                departmentId: "",
                academicYearId: selectedAcademicYearId,
                semesterSelections: {},
            });
            setExpandedDepts([]); // Collapse all departments
            setExpandedSems([]); // Collapse all semesters

            router.push("/feedback-forms"); // Redirect to the main feedback forms page
        } catch (error) {
            showToast.error("Failed to generate forms: " + error);
        } finally {
            setLoading(false);
        }
    }, [selection, selectedAcademicYearId, router]);

    // Render function for semester divisions
    const renderSemesterDivisionCards = useCallback(
        (sem: AcademicSemester, semId: string) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {sem.divisions.map((div) => {
                    const isSelected =
                        selection.semesterSelections[semId]?.divisions.includes(
                            div.id
                        ) || false;
                    return (
                        <div
                            key={div.id}
                            className={`
                                p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                                ${
                                    isSelected
                                        ? "border-primary bg-primary/10"
                                        : "border-light-secondary dark:border-dark-secondary hover:border-primary/50"
                                }
                            `}
                            onClick={() =>
                                handleDivisionSelect(
                                    semId,
                                    div.id,
                                    sem.divisions
                                )
                            }
                        >
                            <div className="flex items-center justify-between space-x-4">
                                <div>
                                    <p className="font-medium text-light-text dark:text-dark-text">
                                        Division {div.divisionName}
                                    </p>
                                    <p className="text-sm text-light-muted-text dark:text-dark-muted-text">
                                        Semester {sem.semesterNumber}
                                    </p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                        e.stopPropagation(); // Prevent card click from firing again
                                        handleDivisionSelect(
                                            semId,
                                            div.id,
                                            sem.divisions
                                        );
                                    }}
                                    aria-label={`Select division ${div.divisionName}`}
                                    className="h-5 w-5 rounded border-light-secondary text-primary focus:ring-primary dark:text-primary dark:focus:ring-primary"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        ),
        [selection.semesterSelections, handleDivisionSelect]
    );

    if (isLoadingAcademicYears || isLoadingStructure) {
        return <PageLoader text="Loading Academic Structure..." />;
    }

    return (
        <div className="min-h-screen bg-light-muted-background dark:bg-dark-background">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 md:py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-full transition-colors text-light-muted-text dark:text-dark-muted-text hover:bg-light-hover dark:hover:bg-dark-hover"
                            title="Go back"
                            aria-label="Go back to previous page"
                        >
                            <ArrowLeftIcon className="h-6 w-6" />
                        </button>
                        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                            Generate Feedback Forms
                        </h1>
                    </div>

                    {/* Academic Year Selector */}
                    {academicYears.length > 0 && (
                        <Card className="bg-light-background dark:bg-dark-background shadow-md p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-grow flex flex-col sm:flex-row sm:items-center gap-4">
                                <h3 className="text-xl font-semibold text-light-text dark:text-dark-text min-w-[150px]">
                                    Academic Year:
                                </h3>
                                <Select
                                    id="academic-year-select"
                                    name="academicYear"
                                    title="Select Academic Year"
                                    value={selectedAcademicYearId}
                                    className="text-lg w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-xl shadow-sm
                                       bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text
                                       focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-primary-main
                                       transition-colors appearance-none pr-10"
                                    onChange={handleAcademicYearChange}
                                >
                                    {academicYears.map((year) => (
                                        <option key={year.id} value={year.id}>
                                            {year.yearString}{" "}
                                            {year.isActive && "(Active)"}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                            <Button
                                onClick={handlePreviewSelection}
                                disabled={
                                    !selection.departmentId ||
                                    Object.values(
                                        selection.semesterSelections
                                    ).every((sem) => sem.divisions.length === 0)
                                }
                                className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0"
                                variant="secondary" // Assuming a 'secondary' variant for preview
                            >
                                <EyeIcon className="h-5 w-5" />
                                <span>Preview Selection</span>
                            </Button>
                        </Card>
                    )}

                    <Card className="bg-light-background dark:bg-dark-background shadow-md p-6">
                        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
                            Select Departments, Semesters & Divisions
                        </h2>
                        <div className="max-h-[calc(100vh-380px)] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-5">
                                {academicStructure.length > 0 ? (
                                    academicStructure.map((dept) => (
                                        <div
                                            key={dept.id}
                                            className={`rounded-xl border-2 transition-all duration-200
                                                ${
                                                    selection.departmentId ===
                                                    dept.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-light-secondary dark:border-dark-secondary hover:border-light-primary/30 dark:hover:border-dark-primary/30"
                                                }
                                            `}
                                        >
                                            <div
                                                className="flex items-center justify-between p-4 cursor-pointer"
                                                onClick={() =>
                                                    handleDepartmentSelect(
                                                        dept.id
                                                    )
                                                }
                                            >
                                                <div className="flex items-center gap-3 flex-grow">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleDepartmentExpansion(
                                                                dept.id
                                                            );
                                                        }}
                                                        className="p-1.5 rounded-full hover:bg-light-muted-background dark:hover:bg-dark-muted-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                        aria-label={
                                                            expandedDepts.includes(
                                                                dept.id
                                                            )
                                                                ? `Collapse ${dept.name} department`
                                                                : `Expand ${dept.name} department`
                                                        }
                                                    >
                                                        {expandedDepts.includes(
                                                            dept.id
                                                        ) ? (
                                                            <ChevronDownIcon className="h-5 w-5 text-light-text dark:text-dark-text" />
                                                        ) : (
                                                            <ChevronRightIcon className="h-5 w-5 text-light-text dark:text-dark-text" />
                                                        )}
                                                    </button>
                                                    <span className="font-semibold text-light-text dark:text-dark-text text-lg">
                                                        Department of{" "}
                                                        {dept.name}
                                                    </span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selection.departmentId ===
                                                        dept.id
                                                    }
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        handleDepartmentSelect(
                                                            dept.id
                                                        );
                                                    }}
                                                    aria-label={`Select ${dept.name} department`}
                                                    className="h-5 w-5 rounded border-light-secondary text-primary focus:ring-primary dark:text-primary dark:focus:ring-primary"
                                                />
                                            </div>

                                            <AnimatePresence>
                                                {expandedDepts.includes(
                                                    dept.id
                                                ) && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            height: "auto",
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                        className="border-t border-light-secondary dark:border-dark-secondary bg-light-muted-background dark:bg-dark-muted-background overflow-hidden rounded-b-xl"
                                                    >
                                                        <div className="p-4 space-y-4">
                                                            {dept.semesters
                                                                .length > 0 ? (
                                                                dept.semesters
                                                                    .filter(
                                                                        (sem) =>
                                                                            sem
                                                                                .divisions
                                                                                .length >
                                                                            0
                                                                    )
                                                                    .map(
                                                                        (
                                                                            sem
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    sem.id
                                                                                }
                                                                                className="border-l-2 border-primary pl-4"
                                                                            >
                                                                                <div
                                                                                    className="flex items-center justify-between p-3 hover:bg-light-background dark:hover:bg-dark-background rounded-lg cursor-pointer"
                                                                                    onClick={() =>
                                                                                        handleSemesterSelect(
                                                                                            sem.id,
                                                                                            sem.divisions
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <div className="flex items-center gap-3 flex-grow">
                                                                                        <button
                                                                                            onClick={(
                                                                                                e
                                                                                            ) => {
                                                                                                e.stopPropagation();
                                                                                                toggleSemesterExpansion(
                                                                                                    sem.id
                                                                                                );
                                                                                            }}
                                                                                            className="p-1.5 rounded-full hover:bg-light-muted-background dark:hover:bg-dark-muted-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                                                            aria-label={
                                                                                                expandedSems.includes(
                                                                                                    sem.id
                                                                                                )
                                                                                                    ? `Collapse semester ${sem.semesterNumber}`
                                                                                                    : `Expand semester ${sem.semesterNumber}`
                                                                                            }
                                                                                        >
                                                                                            {expandedSems.includes(
                                                                                                sem.id
                                                                                            ) ? (
                                                                                                <ChevronDownIcon className="h-5 w-5 text-light-text dark:text-dark-text" />
                                                                                            ) : (
                                                                                                <ChevronRightIcon className="h-5 w-5 text-light-text dark:text-dark-text" />
                                                                                            )}
                                                                                        </button>
                                                                                        <span
                                                                                            className="font-medium text-light-text dark:text-dark-text text-base"
                                                                                            onClick={(
                                                                                                e
                                                                                            ) => {
                                                                                                e.stopPropagation(); // Prevent semester checkbox from toggling
                                                                                                toggleSemesterExpansion(
                                                                                                    sem.id
                                                                                                );
                                                                                            }}
                                                                                        >
                                                                                            Semester{" "}
                                                                                            {
                                                                                                sem.semesterNumber
                                                                                            }
                                                                                            <span className="text-sm text-light-muted-text dark:text-dark-muted-text ml-2">
                                                                                                (
                                                                                                {
                                                                                                    sem
                                                                                                        .academicYear
                                                                                                        .yearString
                                                                                                }

                                                                                                )
                                                                                            </span>
                                                                                        </span>
                                                                                    </div>
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={
                                                                                            selection
                                                                                                .semesterSelections[
                                                                                                sem
                                                                                                    .id
                                                                                            ]
                                                                                                ?.selected ||
                                                                                            false
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) => {
                                                                                            e.stopPropagation();
                                                                                            handleSemesterSelect(
                                                                                                sem.id,
                                                                                                sem.divisions
                                                                                            );
                                                                                        }}
                                                                                        aria-label={`Select semester ${sem.semesterNumber}`}
                                                                                        className="h-5 w-5 rounded border-light-secondary text-primary focus:ring-primary dark:text-primary dark:focus:ring-primary"
                                                                                    />
                                                                                </div>
                                                                                <AnimatePresence>
                                                                                    {expandedSems.includes(
                                                                                        sem.id
                                                                                    ) && (
                                                                                        <motion.div
                                                                                            initial={{
                                                                                                opacity: 0,
                                                                                                height: 0,
                                                                                            }}
                                                                                            animate={{
                                                                                                opacity: 1,
                                                                                                height: "auto",
                                                                                            }}
                                                                                            exit={{
                                                                                                opacity: 0,
                                                                                                height: 0,
                                                                                            }}
                                                                                            transition={{
                                                                                                duration: 0.2,
                                                                                            }}
                                                                                            className="overflow-hidden"
                                                                                        >
                                                                                            {renderSemesterDivisionCards(
                                                                                                sem,
                                                                                                sem.id
                                                                                            )}
                                                                                        </motion.div>
                                                                                    )}
                                                                                </AnimatePresence>
                                                                            </div>
                                                                        )
                                                                    )
                                                            ) : (
                                                                <div className="text-center text-light-muted-text dark:text-dark-muted-text py-4 italic">
                                                                    No semesters
                                                                    with
                                                                    divisions
                                                                    available
                                                                    for this
                                                                    department.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-light-muted-text dark:text-dark-muted-text py-8">
                                        No academic structure available for the
                                        selected year.
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Preview Modal */}
            <AnimatePresence>
                {showSelectionPreview && (
                    <PreviewModal
                        isOpen={showSelectionPreview}
                        onClose={() => setShowSelectionPreview(false)}
                        selection={selection}
                        academicStructure={academicStructure}
                        onGenerate={handleGenerateForms}
                        loading={loading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

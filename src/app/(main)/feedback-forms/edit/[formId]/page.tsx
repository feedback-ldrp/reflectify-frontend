"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowLeftIcon,
    CheckIcon,
    XMarkIcon,
    PlusIcon,
    TrashIcon,
    IdentificationIcon,
    ChatBubbleBottomCenterIcon,
    Bars3BottomLeftIcon,
    ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { showToast } from "@/lib/toast";
import "react-day-picker/style.css";
// Import components
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/common/Loader";
import OverrideStudentsCard from "@/components/feedback/OverrideStudentsCard";

// Import services
import feedbackFormService from "@/services/feedbackFormService";
import feedbackQuestionService from "@/services/feedbackQuestionService";
import facultyService from "@/services/facultyService";
import subjectService from "@/services/subjectService";

// Import interfaces
import {
    FeedbackForm,
    FeedbackFormStatus,
    AddQuestionToFormInput,
} from "@/interfaces/feedbackForm";
import { UpdateFeedbackQuestionData } from "@/interfaces/feedbackQuestion";
import { Faculty } from "@/interfaces/faculty";
import { Subject } from "@/interfaces/subject";
import { QuestionCategory } from "@/interfaces/questionCategory";
import {
    Select,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui";
import DateRangePicker from "@/components/feedback/DateRangePicker";
import { X } from "lucide-react";
import { PageLoader } from "@/components/ui/LoadingSpinner";
interface EditFeedbackFormPageProps {
    params: { formId: string };
}

export default function EditFeedbackFormPage({
    params,
}: EditFeedbackFormPageProps) {
    const router = useRouter();
    const { formId } = params;
    const [form, setForm] = useState<FeedbackForm | null>(null);
    const [editedForm, setEditedForm] = useState<FeedbackForm | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [newQuestion, setNewQuestion] = useState<AddQuestionToFormInput>({
        text: "",
        type: "RATING",
        categoryId: "",
        facultyId: "",
        subjectId: "",
        displayOrder: 0,
    });
    const [activeTab, setActiveTab] = useState<
        "Form Details" | "Form Students" | "Form Questions"
    >("Form Details");

    // State for delete confirmation
    const [awaitingSecondConfirmation, setAwaitingSecondConfirmation] =
        useState<string | null>(null);

    // State for dropdown data
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [categories, setCategories] = useState<QuestionCategory[]>([]);
    const [loadingDropdowns, setLoadingDropdowns] = useState(true);

    const fetchForm = useCallback(async () => {
        try {
            const formData = await feedbackFormService.getFormById(formId);
            setForm(formData);
            setEditedForm(JSON.parse(JSON.stringify(formData)));
        } catch (error) {
            showToast.error("Failed to load feedback form: " + error);
            router.push("/feedback-forms");
        } finally {
            setLoading(false);
        }
    }, [formId, router]);

    const fetchDropdownData = useCallback(async () => {
        try {
            const [facultiesData, subjectsData, categoriesData] =
                await Promise.all([
                    facultyService.getAllFaculties(),
                    subjectService.getAllSubjects(),
                    feedbackQuestionService.getAllQuestionCategories(),
                ]);

            setFaculties(facultiesData);
            setSubjects(subjectsData);
            setCategories(categoriesData);

            // Don't log categories state here - it won't be updated yet due to async nature of setState
        } catch (error) {
            showToast.error("Failed to load dropdown data: " + error);
        } finally {
            setLoadingDropdowns(false);
        }
    }, []);

    useEffect(() => {
        fetchForm();
        fetchDropdownData();
    }, [fetchForm, fetchDropdownData]);

    const handleFormUpdate = (field: keyof FeedbackForm, value: any) => {
        if (!editedForm) return;
        setEditedForm({
            ...editedForm,
            [field]: value,
        });
        setHasChanges(true);
    };

    const handleStatusUpdate = async () => {
        if (!editedForm) return;

        setSaving(true);
        try {
            const updatedForm = await feedbackFormService.updateFormStatus(
                formId,
                {
                    title: editedForm.title,
                    description: editedForm.description,
                    status: editedForm.status,
                    startDate: editedForm.startDate,
                    endDate: editedForm.endDate,
                }
            );

            setForm(updatedForm);
            setEditedForm(JSON.parse(JSON.stringify(updatedForm)));
            setHasChanges(false);
            showToast.success("Form status updated successfully");
        } catch (error) {
            showToast.error("Failed to update form status: " + error);
        } finally {
            setSaving(false);
        }
    };

    const handleAddQuestion = async () => {
        if (!editedForm || !newQuestion.text.trim()) {
            showToast.error("Please enter a question text");
            return;
        }

        // Additional validation checks
        if (!newQuestion.categoryId) {
            showToast.error("Please select a category");
            return;
        }
        if (!newQuestion.facultyId) {
            showToast.error("Please select a faculty");
            return;
        }
        if (!newQuestion.subjectId) {
            showToast.error("Please select a subject");
            return;
        }

        // Check if the selected IDs exist in the loaded data
        const selectedCategory = categories.find(
            (c) => c.id === newQuestion.categoryId
        );
        if (!selectedCategory) {
            showToast.error(
                "Selected category is invalid. Please select a valid category."
            );
            return;
        }

        const selectedFaculty = faculties.find(
            (f) => f.id === newQuestion.facultyId
        );
        if (!selectedFaculty) {
            showToast.error(
                "Selected faculty is invalid. Please select a valid faculty."
            );
            return;
        }

        const selectedSubject = subjects.find(
            (s) => s.id === newQuestion.subjectId
        );
        if (!selectedSubject) {
            showToast.error(
                "Selected subject is invalid. Please select a valid subject."
            );
            return;
        }

        setSaving(true);
        try {
            const questionData = {
                ...newQuestion,
                displayOrder: editedForm.questions.length + 1,
            };

            const updatedForm = await feedbackFormService.addQuestionToForm(
                formId,
                questionData
            );
            setForm(updatedForm);
            setEditedForm(JSON.parse(JSON.stringify(updatedForm)));

            setNewQuestion({
                text: "",
                type: "RATING",
                categoryId: "",
                facultyId: "",
                subjectId: "",
                displayOrder: 0,
            });
            setShowAddQuestion(false);
            showToast.success("Question added successfully");
        } catch (error) {
            showToast.error("Failed to add question: " + error);
        } finally {
            setSaving(false);
        }
    };

    const handleQuestionUpdate = async (
        questionId: string,
        updateData: UpdateFeedbackQuestionData
    ) => {
        if (!editedForm) return;

        try {
            // Update the question in the backend
            const updatedQuestion =
                await feedbackQuestionService.updateFeedbackQuestion(
                    questionId,
                    updateData
                );

            // Update the local state
            const updatedQuestions = editedForm.questions.map((q) =>
                q.id === questionId ? { ...q, ...updatedQuestion } : q
            );

            const updatedForm = { ...editedForm, questions: updatedQuestions };
            setEditedForm(updatedForm);
            setHasChanges(true);
        } catch (error) {
            showToast.error("Failed to update question: " + error);
        }
    };

    const handleQuestionDelete = async (questionId: string) => {
        if (!editedForm) return;

        if (!confirm("Are you sure you want to delete this question?")) {
            return;
        }

        try {
            await feedbackQuestionService.softDeleteFeedbackQuestion(
                questionId
            );

            // Update the local state
            const updatedQuestions = editedForm.questions.filter(
                (q) => q.id !== questionId
            );
            const updatedForm = { ...editedForm, questions: updatedQuestions };
            setEditedForm(updatedForm);
            setHasChanges(true);
            showToast.success("Question deleted successfully");
        } catch (error) {
            showToast.error("Failed to delete question: " + error);
        }
    };

    const handleDiscardChanges = () => {
        if (!form) return;
        setEditedForm(JSON.parse(JSON.stringify(form)));
        setHasChanges(false);
        // Router refresh
        window.location.reload();
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "active":
                return "text-green-600 bg-green-50 border-green-200 dark:bg-green-600/30 dark:border-green-600 dark:text-green-200";
            case "draft":
                return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-600/30 dark:border-yellow-600 dark:text-yellow-200";
            case "closed":
                return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-600/30 dark:border-blue-600 dark:text-blue-200";
            default:
                return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-600/30 dark:border-gray-600 dark:text-gray-200";
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleDateRangeChange = (startDate?: string, endDate?: string) => {
        setEditedForm((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                startDate: startDate,
                endDate: endDate,
            };
        });
        // You might also want to set hasChanges(true) here
        setHasChanges(true);
    };

    // Helper function to check if questions can be modified
    const canModifyQuestions = form?.status === FeedbackFormStatus.DRAFT;

    if (loading) {
        return <PageLoader text="Loading Feedback Form" />;
    }

    if (!editedForm) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light-muted-background dark:bg-dark-background">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-light-text dark:text-dark-text">
                        Feedback Form Not Found
                    </h1>
                    <Button
                        onClick={() => router.push("/feedback-forms")}
                        className="mt-4"
                    >
                        Back to Feedback Forms
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light-muted-background dark:bg-dark-background">
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 md:py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                aria-label="Go Back"
                                onClick={() => router.back()}
                                className="p-2 text-light-text dark:text-dark-text"
                            >
                                <ArrowLeftIcon className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-semibold text-light-text dark:text-dark-text">
                                    Edit {form!.title}
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Tabs List */}
                    <Tabs
                        value={activeTab}
                        onValueChange={(value: string) =>
                            setActiveTab(value as any)
                        }
                    >
                        <div className="pb-6 border-b border-light-secondary dark:border-dark-secondary">
                            <TabsList className="grid w-full grid-cols-3 gap-4 rounded-xl p-1">
                                <TabsTrigger
                                    value="Form Details"
                                    className="flex items-center gap-2 text-lg py-2"
                                >
                                    <Bars3BottomLeftIcon className="w-6 h-6" />
                                    Form Details
                                </TabsTrigger>
                                <TabsTrigger
                                    value="Form Students"
                                    className="flex items-center gap-2 text-lg py-2"
                                >
                                    <IdentificationIcon className="w-6 h-6" />
                                    Students List
                                </TabsTrigger>
                                <TabsTrigger
                                    value="Form Questions"
                                    className="flex items-center gap-2 text-lg py-2"
                                >
                                    <ChatBubbleBottomCenterIcon className="w-6 h-6" />
                                    Form Questions
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-1">
                            <TabsContent value="Form Details">
                                <div className="space-y-6">
                                    <Card className="p-6 bg-light-background dark:bg-dark-muted-background space-y-6">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center justify-center">
                                                <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text flex items-center justify-center gap-3">
                                                    Form Details{" "}
                                                    <span
                                                        className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(
                                                            form!.status
                                                        )}`}
                                                    >
                                                        {form!.status}
                                                    </span>
                                                </h2>
                                            </div>
                                            {loading && <Loader size="sm" />}
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-row gap-2">
                                                    <button
                                                        onClick={
                                                            handleDiscardChanges
                                                        }
                                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                                        disabled={!hasChanges}
                                                    >
                                                        <XMarkIcon className="h-6 w-6" />
                                                        Discard Changes
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleStatusUpdate
                                                        }
                                                        disabled={!hasChanges}
                                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                                                                        hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                                                                        transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {saving ? (
                                                            <Loader />
                                                        ) : (
                                                            <CheckIcon className="h-6 w-6" />
                                                        )}
                                                        {saving
                                                            ? "Saving..."
                                                            : "Save Changes"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full grid grid-cols-3 items-center gap-4">
                                            <div className="flex gap-3 flex-col">
                                                <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                                    Title:{" "}
                                                    <span className="text-light-text dark:text-dark-text font-semibold">
                                                        {form!.title}
                                                    </span>
                                                </p>
                                                {form!.division!.department && (
                                                    <div>
                                                        <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                                            Department:{" "}
                                                            <span className="text-light-text dark:text-dark-text font-semibold">
                                                                {
                                                                    form!
                                                                        .division!
                                                                        .department!
                                                                        .name
                                                                }
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-3 flex-col items-center">
                                                {form!.title && (
                                                    <div>
                                                        <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                                            Semester:{" "}
                                                            <span className="text-light-text dark:text-dark-text font-semibold">
                                                                {/* Extract from title - title has only 1 number which is the semester number */}
                                                                {
                                                                    form!.title.match(
                                                                        /(\d+)/
                                                                    )?.[0]
                                                                }
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}
                                                {editedForm.division && (
                                                    <div>
                                                        <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                                            Division:{" "}
                                                            <span className="text-light-text dark:text-dark-text font-semibold">
                                                                {
                                                                    editedForm
                                                                        .division
                                                                        .divisionName
                                                                }
                                                            </span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-3 flex-col items-end">
                                                <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                                    Start Date:{" "}
                                                    <span className="text-light-text dark:text-dark-text font-semibold">
                                                        {formatDate(
                                                            form!.startDate
                                                        )}
                                                    </span>
                                                </p>
                                                <p className="text-md text-light-muted-text dark:text-dark-muted-text">
                                                    End Date:{" "}
                                                    <span className="text-light-text dark:text-dark-text font-semibold">
                                                        {formatDate(
                                                            form!.endDate
                                                        )}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                    <Card className="p-6 bg-light-background dark:bg-dark-muted-background">
                                        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-8 flex items-center gap-3">
                                            Edit Form Details
                                        </h2>
                                        <div className="rounded-xl">
                                            <div className="flex flex-row items-stretch  gap-4 rounded-xl ">
                                                {/* Form General Information Section */}
                                                <div className="flex-1 rounded-lg">
                                                    <div className="space-y-6">
                                                        {/* Title */}
                                                        <div>
                                                            <label
                                                                htmlFor="form-title"
                                                                className="block text-md font-medium text-light-text dark:text-dark-text mb-2"
                                                            >
                                                                Form Title{" "}
                                                                <span className="text-red-500">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                id="form-title"
                                                                value={
                                                                    editedForm.title
                                                                }
                                                                onChange={(e) =>
                                                                    handleFormUpdate(
                                                                        "title",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                className="w-full px-4 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                                placeholder="e.g., Customer Feedback Survey"
                                                                required
                                                            />
                                                        </div>

                                                        {/* Description */}
                                                        <div>
                                                            <label
                                                                htmlFor="form-description"
                                                                className="block text-md font-medium text-light-text dark:text-dark-text mb-2"
                                                            >
                                                                Description
                                                                (Optional)
                                                            </label>
                                                            <textarea
                                                                id="form-description"
                                                                value={
                                                                    editedForm.description ||
                                                                    ""
                                                                }
                                                                onChange={(e) =>
                                                                    handleFormUpdate(
                                                                        "description",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                rows={4}
                                                                className="w-full px-2 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                                placeholder="Provide a brief description of this form's purpose."
                                                            />
                                                        </div>

                                                        {/* Status */}
                                                        <div>
                                                            <label
                                                                htmlFor="form-status"
                                                                className="block text-md font-medium text-light-text dark:text-dark-text mb-2"
                                                            >
                                                                Form Status{" "}
                                                                <span className="text-red-500">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <Select
                                                                id="form-status"
                                                                name="status"
                                                                value={
                                                                    editedForm.status
                                                                }
                                                                onChange={(e) =>
                                                                    handleFormUpdate(
                                                                        "status",
                                                                        e.target
                                                                            .value as FeedbackFormStatus
                                                                    )
                                                                }
                                                                aria-label="Form Status"
                                                            >
                                                                <option
                                                                    value={
                                                                        FeedbackFormStatus.DRAFT
                                                                    }
                                                                >
                                                                    Draft
                                                                </option>
                                                                <option
                                                                    value={
                                                                        FeedbackFormStatus.ACTIVE
                                                                    }
                                                                >
                                                                    Active
                                                                </option>
                                                                <option
                                                                    value={
                                                                        FeedbackFormStatus.CLOSED
                                                                    }
                                                                >
                                                                    Closed
                                                                </option>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Form Availability Dates Section */}
                                                <div className="rounded-lg flex items-center">
                                                    <div className="flex justify-center items-start">
                                                        <div className="w-full">
                                                            <label className="block text-md font-medium text-light-text dark:text-dark-text mb-2">
                                                                Select Form
                                                                Dates (Optional)
                                                            </label>
                                                            <DateRangePicker
                                                                initialStartDate={
                                                                    editedForm?.startDate
                                                                }
                                                                initialEndDate={
                                                                    editedForm?.endDate
                                                                }
                                                                onDateRangeChange={
                                                                    handleDateRangeChange
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </TabsContent>
                            <TabsContent
                                value="Form Students"
                                className="space-y-6"
                            >
                                <div className="space-y-6">
                                    <OverrideStudentsCard
                                        formId={formId}
                                        formStatus={form!.status}
                                        formTitle={form!.title}
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent
                                value="Form Questions"
                                className="space-y-6"
                            >
                                {/* Status Warning Card */}

                                <Card className="p-6 bg-light-background dark:bg-dark-muted-background">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-semibold text-light-text dark:text-dark-text">
                                                Form Questions
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setShowAddQuestion(true)
                                            }
                                            disabled={!canModifyQuestions}
                                            className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <PlusIcon className="h-6 w-6" />
                                            Add Question
                                        </button>
                                    </div>

                                    {/* Information Banner */}
                                    {!canModifyQuestions && (
                                        <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                            <p className="text-md text-yellow-800 dark:text-yellow-300">
                                                <ExclamationTriangleIcon className="w-6 h-6 inline mr-1" />
                                                Questions can only be modified
                                                when the form is in DRAFT
                                                status.
                                            </p>
                                        </div>
                                    )}
                                </Card>

                                {/* Questions */}
                                <Card className="p-6 bg-light-background dark:bg-dark-muted-background">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
                                            Questions (
                                            {editedForm.questions?.length || 0})
                                        </h2>
                                    </div>

                                    {/* Add Question Form */}
                                    {showAddQuestion && canModifyQuestions && (
                                        <Card className="hover:shadow-lg transition-shadow mb-6 p-4 border border-light-secondary dark:border-dark-secondary dark:bg-dark-background rounded-lg bg-light-background">
                                            <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
                                                Add New Question
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                                        Question Text
                                                    </label>
                                                    <textarea
                                                        value={newQuestion.text}
                                                        onChange={(e) =>
                                                            setNewQuestion({
                                                                ...newQuestion,
                                                                text: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        rows={2}
                                                        disabled={
                                                            !canModifyQuestions
                                                        }
                                                        className="w-full px-3 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        placeholder="Enter your question..."
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                                            Faculty
                                                        </label>
                                                        <Select
                                                            name="faculty-select"
                                                            id="faculty-select"
                                                            value={
                                                                newQuestion.facultyId
                                                            }
                                                            onChange={(e) =>
                                                                setNewQuestion({
                                                                    ...newQuestion,
                                                                    facultyId:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                            aria-label="Select Faculty for New Question"
                                                            disabled={
                                                                loadingDropdowns ||
                                                                !canModifyQuestions
                                                            }
                                                        >
                                                            <option value="">
                                                                Select Faculty
                                                            </option>
                                                            {faculties.map(
                                                                (faculty) => (
                                                                    <option
                                                                        key={
                                                                            faculty.id
                                                                        }
                                                                        value={
                                                                            faculty.id
                                                                        }
                                                                    >
                                                                        {
                                                                            faculty.name
                                                                        }{" "}
                                                                        (
                                                                        {
                                                                            faculty.abbreviation
                                                                        }
                                                                        )
                                                                    </option>
                                                                )
                                                            )}
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                                            Subject
                                                        </label>
                                                        <Select
                                                            name="subject-select"
                                                            id="subject-select"
                                                            value={
                                                                newQuestion.subjectId
                                                            }
                                                            onChange={(e) =>
                                                                setNewQuestion({
                                                                    ...newQuestion,
                                                                    subjectId:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                            aria-label="Select Subject for New Question"
                                                            disabled={
                                                                loadingDropdowns ||
                                                                !canModifyQuestions
                                                            }
                                                        >
                                                            {subjects.map(
                                                                (subject) => (
                                                                    <option
                                                                        key={
                                                                            subject.id
                                                                        }
                                                                        value={
                                                                            subject.id
                                                                        }
                                                                    >
                                                                        {
                                                                            subject.name
                                                                        }{" "}
                                                                        (
                                                                        {
                                                                            subject.abbreviation
                                                                        }
                                                                        )
                                                                    </option>
                                                                )
                                                            )}
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                                            Category
                                                        </label>
                                                        <Select
                                                            id="category-select"
                                                            name="category"
                                                            value={
                                                                newQuestion.categoryId
                                                            }
                                                            onChange={(e) =>
                                                                setNewQuestion({
                                                                    ...newQuestion,
                                                                    categoryId:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            }
                                                            aria-label="Select Category for New Question"
                                                            disabled={
                                                                loadingDropdowns ||
                                                                !canModifyQuestions
                                                            }
                                                        >
                                                            <option value="">
                                                                Select Category
                                                            </option>
                                                            {categories.map(
                                                                (category) => (
                                                                    <option
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        value={
                                                                            category.id
                                                                        }
                                                                    >
                                                                        {
                                                                            category.categoryName
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </Select>
                                                    </div>
                                                    {/* Batch Selection */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                                                            Batch
                                                        </label>
                                                        <Select
                                                            id="batch-select"
                                                            name="batch-select"
                                                            value={
                                                                newQuestion.batch ||
                                                                "None"
                                                            }
                                                            onChange={(
                                                                e: React.ChangeEvent<HTMLSelectElement>
                                                            ) =>
                                                                setNewQuestion({
                                                                    ...newQuestion,
                                                                    batch:
                                                                        e.target
                                                                            .value ===
                                                                        "None"
                                                                            ? undefined
                                                                            : e
                                                                                  .target
                                                                                  .value,
                                                                })
                                                            }
                                                            aria-label="Select Batch"
                                                            disabled={
                                                                !canModifyQuestions
                                                            }
                                                        >
                                                            <option value="None">
                                                                None
                                                            </option>
                                                            <option value="1">
                                                                Batch 1
                                                            </option>
                                                            <option value="2">
                                                                Batch 2
                                                            </option>
                                                            <option value="3">
                                                                Batch 3
                                                            </option>
                                                            <option value="1*">
                                                                Batch 1*
                                                            </option>
                                                            <option value="2*">
                                                                Batch 2*
                                                            </option>
                                                            <option value="3*">
                                                                Batch 3*
                                                            </option>
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                newQuestion.isRequired ||
                                                                false
                                                            }
                                                            onChange={(e) =>
                                                                setNewQuestion({
                                                                    ...newQuestion,
                                                                    isRequired:
                                                                        e.target
                                                                            .checked,
                                                                })
                                                            }
                                                            disabled={
                                                                !canModifyQuestions
                                                            }
                                                            className="w-4 h-4 rounded border-light-secondary dark:border-dark-secondary text-primary focus:ring-primary"
                                                        />
                                                        <span className="text-light-text dark:text-dark-text">
                                                            Required Response
                                                        </span>
                                                    </label>
                                                </div>

                                                <div className="flex w-full items-center justify-end gap-3">
                                                    <button
                                                        onClick={() =>
                                                            setShowAddQuestion(
                                                                false
                                                            )
                                                        }
                                                        className="flex py-2 px-3 items-center bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed gap-2 border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                                    >
                                                        <X className="w-6 h-6" />
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={
                                                            handleAddQuestion
                                                        }
                                                        disabled={
                                                            saving ||
                                                            !newQuestion.text.trim() ||
                                                            !newQuestion.facultyId ||
                                                            !newQuestion.subjectId ||
                                                            !newQuestion.categoryId ||
                                                            !canModifyQuestions
                                                        }
                                                        className="text-sm flex items-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                                                                        hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                                                                        transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {saving ? (
                                                            <Loader />
                                                        ) : (
                                                            <CheckIcon className="h-4 w-4" />
                                                        )}
                                                        {saving
                                                            ? "Adding..."
                                                            : "Add Question"}
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    )}

                                    {/* Questions List */}
                                    {editedForm.questions &&
                                    editedForm.questions.length > 0 ? (
                                        <div className="space-y-4">
                                            {editedForm.questions.map(
                                                (question, index) => (
                                                    <Card
                                                        key={question.id}
                                                        className="p-6 hover:shadow-lg border border-light-secondary dark:border-dark-secondary transition-shadow"
                                                    >
                                                        <div className="space-y-4">
                                                            {/* Question Header */}
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-2xl text-light-text dark:text-dark-text font-bold text-primary">
                                                                    Q{index + 1}
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        question.text
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        handleQuestionUpdate(
                                                                            question.id,
                                                                            {
                                                                                text: e
                                                                                    .target
                                                                                    .value,
                                                                            }
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        !canModifyQuestions
                                                                    }
                                                                    className="flex-1 text-lg text-light-text dark:text-dark-text font-medium p-2 border-b border-transparent hover:border-light-secondary dark:hover:border-dark-secondary focus:border-primary focus:outline-none bg-transparent"
                                                                    placeholder="Enter question text"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    title={
                                                                        awaitingSecondConfirmation ===
                                                                        question.id
                                                                            ? "Are you sure?"
                                                                            : "Delete Question"
                                                                    }
                                                                    onClick={() => {
                                                                        if (
                                                                            awaitingSecondConfirmation ===
                                                                            question.id
                                                                        ) {
                                                                            handleQuestionDelete(
                                                                                question.id
                                                                            );
                                                                            setAwaitingSecondConfirmation(
                                                                                null
                                                                            );
                                                                        } else {
                                                                            setAwaitingSecondConfirmation(
                                                                                question.id
                                                                            );
                                                                            setTimeout(
                                                                                () => {
                                                                                    setAwaitingSecondConfirmation(
                                                                                        null
                                                                                    );
                                                                                },
                                                                                5000
                                                                            );
                                                                        }
                                                                    }}
                                                                    disabled={
                                                                        !canModifyQuestions
                                                                    }
                                                                    className={`flex py-2 px-3 items-center gap-1 bg-transparent border rounded-xl text-sm transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                        awaitingSecondConfirmation ===
                                                                        question.id
                                                                            ? "border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20"
                                                                            : "border-red-600 text-red-600 dark:border-red-500 dark:text-red-400 hover:shadow-lg dark:hover:shadow-red-700/20 text-md"
                                                                    }`}
                                                                >
                                                                    {awaitingSecondConfirmation ===
                                                                    question.id ? (
                                                                        <span className="text-lg">
                                                                            Are
                                                                            you
                                                                            sure?
                                                                        </span>
                                                                    ) : (
                                                                        <TrashIcon className="h-6 w-6" />
                                                                    )}
                                                                </button>
                                                            </div>

                                                            {/* Question Details Grid */}
                                                            <div className="grid grid-cols-2 gap-4">
                                                                {/* Faculty Dropdown */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-light-muted-text dark:text-dark-muted-text mb-1">
                                                                        Faculty
                                                                    </label>
                                                                    <Select
                                                                        name="faculty-select"
                                                                        id="faculty-select"
                                                                        value={
                                                                            question.facultyId ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleQuestionUpdate(
                                                                                question.id,
                                                                                {
                                                                                    facultyId:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            loadingDropdowns ||
                                                                            !canModifyQuestions
                                                                        }
                                                                        aria-label="Select Faculty"
                                                                    >
                                                                        <option value="">
                                                                            Select
                                                                            Faculty
                                                                        </option>
                                                                        {faculties.map(
                                                                            (
                                                                                faculty
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        faculty.id
                                                                                    }
                                                                                    value={
                                                                                        faculty.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        faculty.name
                                                                                    }{" "}
                                                                                    (
                                                                                    {
                                                                                        faculty.abbreviation
                                                                                    }

                                                                                    )
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </Select>
                                                                </div>

                                                                {/* Subject Dropdown */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-light-muted-text dark:text-dark-muted-text mb-1">
                                                                        Subject
                                                                    </label>
                                                                    <Select
                                                                        id="select-subject"
                                                                        name="select-subject"
                                                                        value={
                                                                            question.subjectId ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleQuestionUpdate(
                                                                                question.id,
                                                                                {
                                                                                    subjectId:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            loadingDropdowns ||
                                                                            !canModifyQuestions
                                                                        }
                                                                        aria-label="Select Subject"
                                                                    >
                                                                        {subjects.map(
                                                                            (
                                                                                subject
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        subject.id
                                                                                    }
                                                                                    value={
                                                                                        subject.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        subject.name
                                                                                    }{" "}
                                                                                    {subject.abbreviation
                                                                                        ? ` (${subject.abbreviation})`
                                                                                        : ""}
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </Select>
                                                                </div>

                                                                {/* Category Dropdown */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-light-muted-text dark:text-dark-muted-text mb-1">
                                                                        Category
                                                                    </label>
                                                                    <Select
                                                                        id="category-select"
                                                                        name="category-select"
                                                                        value={
                                                                            question.categoryId ||
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleQuestionUpdate(
                                                                                question.id,
                                                                                {
                                                                                    categoryId:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            loadingDropdowns ||
                                                                            !canModifyQuestions
                                                                        }
                                                                        aria-label="Select Category"
                                                                    >
                                                                        <option value="">
                                                                            Select
                                                                            Category
                                                                        </option>
                                                                        {categories.map(
                                                                            (
                                                                                category
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        category.id
                                                                                    }
                                                                                    value={
                                                                                        category.id
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        category.categoryName
                                                                                    }
                                                                                </option>
                                                                            )
                                                                        )}
                                                                    </Select>
                                                                </div>

                                                                {/* Batch Dropdown */}
                                                                <div>
                                                                    <label className="block text-xs font-medium text-light-muted-text dark:text-dark-muted-text mb-1">
                                                                        Batch
                                                                    </label>
                                                                    <Select
                                                                        id="batch-select"
                                                                        name="batch-select"
                                                                        value={
                                                                            question.batch ||
                                                                            "None"
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleQuestionUpdate(
                                                                                question.id,
                                                                                {
                                                                                    batch:
                                                                                        e
                                                                                            .target
                                                                                            .value ===
                                                                                        "None"
                                                                                            ? undefined
                                                                                            : e
                                                                                                  .target
                                                                                                  .value,
                                                                                }
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !canModifyQuestions
                                                                        }
                                                                        aria-label="Select Batch"
                                                                    >
                                                                        <option value="None"></option>
                                                                        <option value="1">
                                                                            Batch
                                                                            1
                                                                        </option>
                                                                        <option value="2">
                                                                            Batch
                                                                            2
                                                                        </option>
                                                                        <option value="3">
                                                                            Batch
                                                                            3
                                                                        </option>
                                                                        <option value="1*">
                                                                            Batch
                                                                            1*
                                                                        </option>
                                                                        <option value="2*">
                                                                            Batch
                                                                            2*
                                                                        </option>
                                                                        <option value="3*">
                                                                            Batch
                                                                            3*
                                                                        </option>
                                                                    </Select>
                                                                </div>
                                                            </div>

                                                            {/* Question Type and Required */}
                                                            <div className="flex items-center justify-between">
                                                                <label className="flex items-center gap-2 cursor-pointer">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            question.isRequired ||
                                                                            false
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleQuestionUpdate(
                                                                                question.id,
                                                                                {
                                                                                    isRequired:
                                                                                        e
                                                                                            .target
                                                                                            .checked,
                                                                                }
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !canModifyQuestions
                                                                        }
                                                                        className="w-4 h-4 rounded border-light-secondary dark:border-dark-secondary text-primary focus:ring-primary"
                                                                    />
                                                                    <span className="text-light-text dark:text-dark-text">
                                                                        Required
                                                                        Response
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-light-muted-text dark:text-dark-muted-text text-center py-8">
                                            No questions added yet. Click
                                            &quot;Add Question&quot; to get
                                            started.
                                        </p>
                                    )}
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"></div>
                </motion.div>
            </div>
        </div>
    );
}

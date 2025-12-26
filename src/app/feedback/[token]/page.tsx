"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { showToast } from "@/lib/toast";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Import components
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/common/Loader";

// Import endpoints
import {
  FEEDBACK_FORM_ENDPOINTS,
  STUDENT_RESPONSE_ENDPOINTS,
} from "@/constants/apiEndpoints";

interface Faculty {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Category {
  id: string;
  categoryName: string;
  description: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  batch?: string;
  isRequired: boolean;
  displayOrder: number;
  faculty?: Faculty;
  subject?: Subject;
  category?: Category;
  options?: string[];
}

interface FeedbackForm {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface StudentFeedbackPageProps {
  params: { token: string };
}

type ResponseValue = number | string;

export default function StudentFeedbackPage({
  params,
}: StudentFeedbackPageProps) {
  const router = useRouter();
  const { token } = params;
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [responses, setResponses] = useState<Record<string, ResponseValue>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extract unique batch values using useMemo
  const availableBatches = React.useMemo(() => {
    if (!form) return [];

    return form.questions
      .map((q) => q.batch)
      .filter(
        (batch): batch is string =>
          !!batch &&
          batch !== "None" &&
          batch !== "-" &&
          batch !== "null" &&
          batch !== "",
      )
      .filter((batch, index, self) => self.indexOf(batch) === index) // Remove duplicates
      .sort((a, b) => {
        // Natural sort for batches like 1, 1*, 2, 2*
        const aPure = a.replace(/\D/g, "");
        const bPure = b.replace(/\D/g, "");

        if (aPure === bPure) {
          return a.localeCompare(b);
        }
        return parseInt(aPure) - parseInt(bPure);
      });
  }, [form]);

  const fetchForm = useCallback(async () => {
    try {
      const response = await fetch(
        FEEDBACK_FORM_ENDPOINTS.ACCESS_BY_TOKEN(token),
      );

      if (!response.ok) {
        // Check if the error is due to form expiration (403 status)
        if (response.status === 403) {
          const errorData = await response.json();
          setIsExpired(true);
          setErrorMessage(errorData.message || "Form has expired");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "success") {
        const formData = data.data?.form || data.data;

        if (formData) {
          // Try to check submission status, but don't fail if this fails
          try {
            const submissionCheck = await fetch(
              STUDENT_RESPONSE_ENDPOINTS.CHECK_SUBMISSION(token),
            );

            if (submissionCheck.ok) {
              const submissionData = await submissionCheck.json();

              if (
                submissionData.status === "success" &&
                submissionData.data?.isSubmitted
              ) {
                setIsSubmitted(true);
                return;
              }
            }
          } catch (submissionError) {
            showToast.error("Submission Status Check Failed: " + submissionError);
          }

          setForm(formData);
        } else {
          showToast.error("No form data received: " + data.message);
        }
      } else {
        showToast.error("API returned error or no data: " + data.message);
      }
    } catch (error) {
      showToast.error("Error fetching form: " + error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  const handleResponseChange = (questionId: string, value: ResponseValue) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

    // Get only the questions that are actually displayed to the user
    const generalQuestions = form.questions.filter(
      (question) => !question.batch || question.batch === "None",
    );

    const batchQuestions = selectedBatch
      ? form.questions.filter((question) => question.batch === selectedBatch)
      : [];

    const displayedQuestions = [...generalQuestions, ...batchQuestions];

    // Validate only the required questions that are displayed to the user
    const requiredQuestions = displayedQuestions.filter((q) => q.isRequired);
    const missingRequired = requiredQuestions.filter(
      (q) => !responses[q.id] || responses[q.id] === "",
    );

    if (missingRequired.length > 0) {
      showToast.error("Please answer all required questions");
      return;
    }

    // Filter responses to only include those for displayed questions
    const filteredResponses: Record<string, ResponseValue> = {};
    displayedQuestions.forEach((question) => {
      if (
        responses[question.id] !== undefined &&
        responses[question.id] !== ""
      ) {
        filteredResponses[question.id] = responses[question.id];
      }
    });

    setSubmitting(true);
    try {
      const response = await fetch(
        STUDENT_RESPONSE_ENDPOINTS.SUBMIT_RESPONSES(token),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(filteredResponses),
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        showToast.success("Feedback submitted successfully");
        setJustSubmitted(true);
        setTimeout(() => {
          router.push("/feedback/thank-you");
        }, 1000);
      } else {
        showToast.error(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      showToast.error("Submission error: " + error);
      showToast.error("Error submitting feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const value = responses[question.id] || "";

    switch (question.type.toUpperCase()) {
      case "RATING":
        return (
          <div className="bg-light-secondary dark:bg-dark-secondary rounded-lg p-6">
            <div className="flex justify-between mb-2 text-sm text-light-muted-text dark:text-dark-muted-text">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <label
                  key={rating}
                  className={`
                                        relative flex flex-col items-center p-2 rounded-lg cursor-pointer
                                        transition-all hover:bg-primary/10
                                        ${
                                          value === rating
                                            ? "bg-primary-main/80 dark:bg-primary-darker"
                                            : "bg-light-background dark:bg-dark-background"
                                        }
                                    `}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={rating}
                    checked={value === rating}
                    onChange={() => handleResponseChange(question.id, rating)}
                    className="sr-only"
                    required={question.isRequired}
                  />
                  <span
                    className={`
                                            text-lg font-semibold mb-1 text-light-text dark:text-dark-text
                                        `}
                  >
                    {rating}
                  </span>
                </label>
              ))}
            </div>
            {value && (
              <div className="mt-4 text-center">
                <span className="text-sm text-light-muted-text dark:text-dark-muted-text">
                  Selected:{" "}
                  <span className="font-semibold text-primary">{value}/10</span>
                </span>
              </div>
            )}
          </div>
        );

      case "TEXT":
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-light-secondary dark:border-dark-secondary rounded-lg bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Enter your response..."
            required={question.isRequired}
          />
        );

      case "MULTIPLE_CHOICE":
        return (
          <div className="space-y-2">
            {question.options?.map((option: string, index: number) => (
              <label
                key={index}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={value === option}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  className="h-4 w-4 text-primary focus:ring-primary border-light-secondary"
                  required={question.isRequired}
                />
                <span className="text-light-text dark:text-dark-text">
                  {option}
                </span>
              </label>
            )) || (
              <p className="text-light-muted-text dark:text-dark-muted-text italic">
                No options configured for this question
              </p>
            )}
          </div>
        );

      case "BOOLEAN":
        return (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="yes"
                checked={value === "yes"}
                onChange={(e) =>
                  handleResponseChange(question.id, e.target.value)
                }
                className="h-4 w-4 text-primary focus:ring-primary border-light-secondary"
                required={question.isRequired}
              />
              <span className="text-light-text dark:text-dark-text">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`question-${question.id}`}
                value="no"
                checked={value === "no"}
                onChange={(e) =>
                  handleResponseChange(question.id, e.target.value)
                }
                className="h-4 w-4 text-primary focus:ring-primary border-light-secondary"
                required={question.isRequired}
              />
              <span className="text-light-text dark:text-dark-text">No</span>
            </label>
          </div>
        );

      default:
        return (
          <p className="text-light-muted-text dark:text-dark-muted-text italic">
            Unknown question type: {question.type}
          </p>
        );
    }
  };

  // Success modal is rendered conditionally based on state

  if (loading) {
    return (
      <div className="min-h-screen max-w-7xl flex items-center justify-center bg-light-muted-background dark:bg-dark-background">
        <div className="text-center">
          <Loader />
          <p className="text-light-text dark:text-dark-text ml-2 mt-2">
            Loading feedback form...
          </p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen max-w-7xl flex items-center justify-center bg-light-muted-background dark:bg-dark-background">
        <Card className="p-8 max-w-md w-full text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
            Form Expired
          </h1>
          <p className="text-light-muted-text dark:text-dark-muted-text mb-4">
            {errorMessage ||
              "This feedback form has expired and is no longer available."}
          </p>
          <p className="text-light-muted-text dark:text-dark-muted-text mb-6">
            Feedback forms are valid for 7 days from when they are shared.
          </p>
          <div className="text-xs text-light-muted-text dark:text-dark-muted-text bg-light-secondary dark:bg-dark-secondary p-2 rounded">
            Token: {token}
          </div>
        </Card>
      </div>
    );
  }

  if (isSubmitted && !justSubmitted) {
    return (
      <div className="min-h-screen max-w-7xl flex items-center justify-center bg-light-muted-background dark:bg-dark-background">
        <Card className="p-8 max-w-md w-full text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
            Feedback Already Submitted
          </h1>
          <p className="text-light-muted-text dark:text-dark-muted-text">
            You have already submitted this feedback. Thank you!
          </p>
        </Card>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen max-w-7xl flex items-center justify-center bg-light-muted-background dark:bg-dark-background">
        <Card className="p-8 max-w-md w-full text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">
            Form Not Found
          </h1>
          <p className="text-light-muted-text dark:text-dark-muted-text mb-4">
            The feedback form could not be found or is no longer available.
          </p>
          <div className="text-xs text-light-muted-text dark:text-dark-muted-text bg-light-secondary dark:bg-dark-secondary p-2 rounded">
            Token: {token}
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  // This condition is already handled above

  // Check if form has batch-specific questions
  const hasBatchQuestions = availableBatches.length > 0;

  if (hasBatchQuestions && !selectedBatch) {
    return (
      <div className="min-h-screen bg-light-muted-background dark:bg-dark-background flex items-center justify-center">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="p-10 bg-light-background dark:bg-dark-muted-background shadow-lg rounded-2xl transition-all">
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-8 text-center">
            Select Your Batch
          </h2>

          <div
            className={`grid gap-4 ${
              availableBatches.length <= 2
                ? `grid-cols-${availableBatches.length}`
                : `grid-cols sm:grid-cols-3`
            }`}
          >
            {availableBatches.map((batch) => (
              <button
                key={batch}
                onClick={() => setSelectedBatch(batch as string)}
                className="text-base flex items-center justify-center py-3 px-5 rounded-xl font-medium transition-all
                           bg-light-highlight dark:bg-dark-highlight text-white hover:bg-primary-dark
                           focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-xl"
              >
                Batch {batch}
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Filter questions based on batch selection and categorize them
  const generalQuestions = form.questions
    .filter(
      (question) =>
        !question.batch ||
        question.batch === "None" ||
        question.batch === "-" ||
        question.batch === "",
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const batchQuestions = selectedBatch
    ? form.questions
        .filter((question) => question.batch === selectedBatch)
        .sort((a, b) => a.displayOrder - b.displayOrder)
    : [];

  return (
    <div className="min-h-screen bg-light-muted-background dark:bg-dark-background px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* {showSuccessModal && <SuccessModal />} */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-7xl mx-auto">
        {" "}
        {/* Removed redundant px/py here, handled by parent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 md:space-y-4" // Adjusted vertical spacing for medium screens
        >
          {/* Header */}
          <Card className="p-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text mb-2">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-sm sm:text-base text-light-muted-text dark:text-dark-muted-text mb-2">
                {form.description}
              </p>
            )}
            <p className="text-sm sm:text-base text-light-muted-text dark:text-dark-muted-text mb-2">
              Your feedback helps us improve the quality of education
            </p>
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-xs sm:text-sm text-light-muted-text dark:text-dark-muted-text">
              <span>All responses are anonymous</span>
              <span>•</span>
              <span>
                Required fields are marked with{" "}
                <span className="text-red-500 text-xs sm:text-sm">*</span>
              </span>
              {selectedBatch && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-primary">
                    Batch {selectedBatch}
                  </span>
                </>
              )}
            </div>
            <div>
              <span
                className="text-light-highlight dark:text-dark-highlight cursor-pointer"
                onClick={() => setSelectedBatch(null)}
              >
                Not Your Batch? Click here to Change Batch
              </span>
            </div>
          </Card>

          {/* Feedback Form */}
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-4">
            {" "}
            {/* Adjusted vertical spacing for medium screens */}
            {/* General/Lecture Questions */}
            {generalQuestions.length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-light-secondary dark:border-dark-secondary pb-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                    Lecture Feedback
                  </h2>
                </div>
                {generalQuestions.map((question, index) => (
                  <Card key={question.id} className="p-4 sm:p-6">
                    {" "}
                    {/* Adjusted card padding */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                        {" "}
                        {/* Responsive flex */}
                        <div className="flex-1 w-full sm:w-auto">
                          {" "}
                          {/* Ensure it takes full width on small screens */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {" "}
                            {/* flex-wrap for small screens */}
                            <span className="text-mdfont-semibold text-light-text dark:text-dark-text">
                              Question {index + 1}
                            </span>
                            {question.isRequired && (
                              <span className="text-red-500 text-xs sm:text-sm">
                                *
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-medium text-light-text dark:text-dark-text mb-2">
                            {question.text}
                          </h3>
                          {(question.faculty || question.subject) && (
                            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-light-muted-text dark:text-dark-muted-text mb-4">
                              {" "}
                              {/* flex-wrap for small screens */}
                              {question.faculty && (
                                <span>Faculty: {question.faculty.name}</span>
                              )}
                              {question.subject && (
                                <span>Subject: {question.subject.name}</span>
                              )}
                            </div>
                          )}
                          {renderQuestionInput(question)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            {/* Batch/Lab Questions */}
            {batchQuestions.length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-light-secondary dark:border-dark-secondary pb-2 mt-6 md:mt-8">
                  {" "}
                  {/* Adjusted top margin */}
                  <h2 className="text-xl sm:text-2xl font-bold text-light-text dark:text-dark-text">
                    Lab Feedback
                  </h2>
                </div>
                {batchQuestions.map((question, index) => (
                  <Card key={question.id} className="p-4 sm:p-6">
                    {" "}
                    {/* Adjusted card padding */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                        {" "}
                        {/* Responsive flex */}
                        <div className="flex-1 w-full sm:w-auto">
                          {" "}
                          {/* Ensure it takes full width on small screens */}
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {" "}
                            {/* flex-wrap for small screens */}
                            <span className="text-md font-semibold text-light-text dark:text-dark-text">
                              Question {generalQuestions.length + index + 1}
                            </span>
                            {question.isRequired && (
                              <span className="text-red-500 text-xs sm:text-sm">
                                *
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-medium text-light-text dark:text-dark-text mb-2">
                            {question.text}
                          </h3>
                          {(question.faculty || question.subject) && (
                            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-light-muted-text dark:text-dark-muted-text mb-4">
                              {" "}
                              {/* flex-wrap for small screens */}
                              {question.faculty && (
                                <span>Faculty: {question.faculty.name}</span>
                              )}
                              {question.subject && (
                                <span>Subject: {question.subject.name}</span>
                              )}
                              {question.batch && question.batch !== "None" && (
                                <span>Batch: {question.batch}</span>
                              )}
                            </div>
                          )}
                          {renderQuestionInput(question)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            {/* Submit Button */}
            <Card className="p-4 sm:p-6 flex flex-col items-center justify-center text-center">
              {" "}
              {/* Adjusted card padding */}
              <button
                type="submit"
                disabled={
                  submitting ||
                  generalQuestions.length + batchQuestions.length === 0
                }
                className="text-center w-48 text-sm flex items-center justify-center gap-2 bg-light-highlight dark:bg-dark-highlight text-white py-2.5 px-4 rounded-xl
                                                                                        hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-main focus:ring-offset-2
                                                                                        transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </button>
              <p className="text-xs sm:text-sm text-light-muted-text dark:text-dark-muted-text mt-2">
                Please ensure all required fields are filled out before
                submitting.
              </p>
            </Card>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

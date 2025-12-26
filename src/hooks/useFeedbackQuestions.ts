/**
@file src/hooks/useFeedbackQuestions.ts
@description React Query hooks for feedback questions and question categories
*/

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import feedbackQuestionService from "@/services/feedbackQuestionService"; // Adjust path
import {
    QuestionCategory,
    CreateQuestionCategoryData,
    UpdateQuestionCategoryData,
} from "@/interfaces/questionCategory"; // Adjust path
import {
    FeedbackQuestion,
    CreateFeedbackQuestionData,
    UpdateFeedbackQuestionData,
    BatchUpdateFeedbackQuestionItem,
} from "@/interfaces/feedbackQuestion"; // Adjust path
import { IdType } from "@/interfaces/common"; // Adjust path
import showToast from "@/lib/toast";

// Query keys for question categories
export const QUESTION_CATEGORY_QUERY_KEYS = {
    all: ["questionCategories"] as const,
    lists: () => [...QUESTION_CATEGORY_QUERY_KEYS.all, "list"] as const,
    detail: (id: IdType) => [...QUESTION_CATEGORY_QUERY_KEYS.all, id] as const,
};

export const FEEDBACK_QUESTION_QUERY_KEYS = {
    all: ["feedbackQuestions"] as const,
    listsByForm: (formId: IdType) =>
        [...FEEDBACK_QUESTION_QUERY_KEYS.all, "listByForm", formId] as const,
    detail: (id: IdType) => [...FEEDBACK_QUESTION_QUERY_KEYS.all, id] as const,
};

// Get all question categories
export const useAllQuestionCategories = () => {
    return useQuery<QuestionCategory[], Error>({
        queryKey: QUESTION_CATEGORY_QUERY_KEYS.lists(),
        queryFn: feedbackQuestionService.getAllQuestionCategories,
    });
};

// Get question category by ID
export const useQuestionCategory = (id: IdType) => {
    return useQuery<QuestionCategory, Error>({
        queryKey: QUESTION_CATEGORY_QUERY_KEYS.detail(id),
        queryFn: () => feedbackQuestionService.getQuestionCategoryById(id),
        enabled: !!id,
    });
};

// Get feedback questions by form ID
export const useFeedbackQuestionsByFormId = (formId: IdType) => {
    return useQuery<FeedbackQuestion[], Error>({
        queryKey: FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(formId),
        queryFn: () =>
            feedbackQuestionService.getFeedbackQuestionsByFormId(formId),
        enabled: !!formId,
    });
};

// Create question category
export const useCreateQuestionCategory = () => {
    const queryClient = useQueryClient();
    return useMutation<QuestionCategory, Error, CreateQuestionCategoryData>({
        mutationFn: feedbackQuestionService.createQuestionCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: QUESTION_CATEGORY_QUERY_KEYS.lists(),
            });
        },
    });
};

// Update question category
export const useUpdateQuestionCategory = () => {
    const queryClient = useQueryClient();
    return useMutation<
        QuestionCategory,
        Error,
        { id: IdType; data: UpdateQuestionCategoryData },
        {
            previousCategory: QuestionCategory | undefined;
            previousCategoriesList: QuestionCategory[] | undefined;
        }
    >({
        mutationFn: ({ id, data }) =>
            feedbackQuestionService.updateQuestionCategory(id, data),
        onSuccess: (updatedCategory) => {
            queryClient.invalidateQueries({
                queryKey: QUESTION_CATEGORY_QUERY_KEYS.lists(),
            });
            queryClient.invalidateQueries({
                queryKey: QUESTION_CATEGORY_QUERY_KEYS.detail(
                    updatedCategory.id
                ),
            });
            queryClient.setQueryData(
                QUESTION_CATEGORY_QUERY_KEYS.detail(updatedCategory.id),
                updatedCategory
            );
        },
        onMutate: async ({ id, data: updateData }) => {
            await queryClient.cancelQueries({
                queryKey: QUESTION_CATEGORY_QUERY_KEYS.detail(id),
            });
            await queryClient.cancelQueries({
                queryKey: QUESTION_CATEGORY_QUERY_KEYS.lists(),
            });

            const previousCategory = queryClient.getQueryData<QuestionCategory>(
                QUESTION_CATEGORY_QUERY_KEYS.detail(id)
            );
            const previousCategoriesList = queryClient.getQueryData<
                QuestionCategory[]
            >(QUESTION_CATEGORY_QUERY_KEYS.lists());

            queryClient.setQueryData<QuestionCategory>(
                QUESTION_CATEGORY_QUERY_KEYS.detail(id),
                (old) => (old ? { ...old, ...updateData } : old)
            );
            queryClient.setQueryData<QuestionCategory[]>(
                QUESTION_CATEGORY_QUERY_KEYS.lists(),
                (old) =>
                    old?.map((category) =>
                        category.id === id
                            ? { ...category, ...updateData }
                            : category
                    )
            );
            return { previousCategory, previousCategoriesList };
        },
        onError: (_err, variables, context) => {
            if (context?.previousCategory) {
                queryClient.setQueryData(
                    QUESTION_CATEGORY_QUERY_KEYS.detail(variables.id),
                    context.previousCategory
                );
            }
            if (context?.previousCategoriesList) {
                queryClient.setQueryData(
                    QUESTION_CATEGORY_QUERY_KEYS.lists(),
                    context.previousCategoriesList
                );
            }
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({
                queryKey: QUESTION_CATEGORY_QUERY_KEYS.detail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: QUESTION_CATEGORY_QUERY_KEYS.lists(),
            });
        },
    });
};

// Soft delete question category
export const useSoftDeleteQuestionCategory = () => {
    const queryClient = useQueryClient();
    return useMutation<
        void,
        Error,
        IdType,
        { previousCategoriesList: QuestionCategory[] | undefined }
    >({
        mutationFn: (id) =>
            feedbackQuestionService.softDeleteQuestionCategory(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: QUESTION_CATEGORY_QUERY_KEYS.lists(),
            });
            queryClient.removeQueries({
                queryKey: QUESTION_CATEGORY_QUERY_KEYS.detail(id),
            });
        },
        onMutate: async (idToDelete) => {
            await queryClient.cancelQueries({
                queryKey: QUESTION_CATEGORY_QUERY_KEYS.lists(),
            });
            const previousCategoriesList = queryClient.getQueryData<
                QuestionCategory[]
            >(QUESTION_CATEGORY_QUERY_KEYS.lists());

            queryClient.setQueryData<QuestionCategory[]>(
                QUESTION_CATEGORY_QUERY_KEYS.lists(),
                (old) => old?.filter((category) => category.id !== idToDelete)
            );
            return { previousCategoriesList };
        },
        onError: (_err, _idToDelete, context) => {
            if (context?.previousCategoriesList) {
                queryClient.setQueryData(
                    QUESTION_CATEGORY_QUERY_KEYS.lists(),
                    context.previousCategoriesList
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: QUESTION_CATEGORY_QUERY_KEYS.lists(),
            });
        },
    });
};

// Create feedback question
export const useCreateFeedbackQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation<
        FeedbackQuestion,
        Error,
        {
            formId: IdType;
            questionData: Omit<CreateFeedbackQuestionData, "formId">;
        }
    >({
        mutationFn: ({ formId, questionData }) =>
            feedbackQuestionService.createFeedbackQuestion(
                formId,
                questionData
            ),
        onSuccess: (newQuestion) => {
            // Invalidate the questions list for the specific form
            queryClient.invalidateQueries({
                queryKey: FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(
                    newQuestion.formId
                ),
            });
            // Also invalidate the feedback form detail if it contains questions as part of its data
            queryClient.invalidateQueries({
                queryKey: ["feedbackForms", newQuestion.formId],
            });
        },
    });
};

export const useSoftDeleteFeedbackQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation<
        void,
        Error,
        IdType,
        {
            previousQuestionsList: FeedbackQuestion[] | undefined;
            formId: IdType | undefined;
        }
    >({
        mutationFn: (id) =>
            feedbackQuestionService.softDeleteFeedbackQuestion(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: FEEDBACK_QUESTION_QUERY_KEYS.all,
            });
            queryClient.removeQueries({
                queryKey: FEEDBACK_QUESTION_QUERY_KEYS.detail(id),
            });
        },
        onMutate: async (idToDelete) => {
            const questionToDelete = queryClient.getQueryData<FeedbackQuestion>(
                FEEDBACK_QUESTION_QUERY_KEYS.detail(idToDelete)
            );
            const formId = questionToDelete?.formId;

            if (formId) {
                await queryClient.cancelQueries({
                    queryKey: FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(formId),
                });
            }
            const previousQuestionsList = formId
                ? queryClient.getQueryData<FeedbackQuestion[]>(
                      FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(formId)
                  )
                : undefined;

            if (formId) {
                queryClient.setQueryData<FeedbackQuestion[]>(
                    FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(formId),
                    (old) => old?.filter((q) => q.id !== idToDelete)
                );
            }
            return { previousQuestionsList, formId };
        },
        onError: (_err, _idToDelete, context) => {
            if (context?.formId && context.previousQuestionsList) {
                queryClient.setQueryData(
                    FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(context.formId),
                    context.previousQuestionsList
                );
            }
        },
        onSettled: (_data, _error, _idToDelete, context) => {
            if (context?.formId) {
                queryClient.invalidateQueries({
                    queryKey: FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(
                        context.formId
                    ),
                });
                queryClient.invalidateQueries({
                    queryKey: ["feedbackForms", context.formId],
                });
            } else {
                queryClient.invalidateQueries({
                    queryKey: FEEDBACK_QUESTION_QUERY_KEYS.all,
                });
            }
        },
    });
};

// Batch update feedback questions
export const useBatchUpdateFeedbackQuestions = () => {
    const queryClient = useQueryClient();
    return useMutation<
        FeedbackQuestion[],
        Error,
        BatchUpdateFeedbackQuestionItem[]
    >({
        mutationFn: feedbackQuestionService.batchUpdateFeedbackQuestions,
        onSuccess: (updatedQuestions) => {
            const formIds = [...new Set(updatedQuestions.map((q) => q.formId))];
            formIds.forEach((formId) => {
                queryClient.invalidateQueries({
                    queryKey: FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(formId),
                });
                queryClient.invalidateQueries({
                    queryKey: ["feedbackForms", formId],
                });
            });
        },
    });
};

// Update feedback question
export const useUpdateFeedbackQuestion = () => {
    const queryClient = useQueryClient();
    return useMutation<
        FeedbackQuestion,
        Error,
        { id: IdType; data: UpdateFeedbackQuestionData },
        {
            previousQuestion: FeedbackQuestion | undefined;
            previousQuestionsList: FeedbackQuestion[] | undefined;
        }
    >({
        mutationFn: ({ id, data }) =>
            feedbackQuestionService.updateFeedbackQuestion(id, data),
        onSuccess: (updatedQuestion) => {
            queryClient.invalidateQueries({
                queryKey: FEEDBACK_QUESTION_QUERY_KEYS.detail(
                    updatedQuestion.id
                ),
            });
            queryClient.invalidateQueries({
                queryKey: FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(
                    updatedQuestion.formId
                ),
            });
            queryClient.invalidateQueries({
                queryKey: ["feedbackForms", updatedQuestion.formId],
            });

            queryClient.setQueryData<FeedbackQuestion>(
                FEEDBACK_QUESTION_QUERY_KEYS.detail(updatedQuestion.id),
                updatedQuestion
            );
        },
        onMutate: async ({ id, data: updateData }) => {
            await queryClient.cancelQueries({
                queryKey: FEEDBACK_QUESTION_QUERY_KEYS.detail(id),
            });
            const questionToUpdate = queryClient.getQueryData<FeedbackQuestion>(
                FEEDBACK_QUESTION_QUERY_KEYS.detail(id)
            );
            const formId = questionToUpdate?.formId;

            if (formId) {
                await queryClient.cancelQueries({
                    queryKey: FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(formId),
                });
            }

            const previousQuestion = questionToUpdate;
            const previousQuestionsList = formId
                ? queryClient.getQueryData<FeedbackQuestion[]>(
                      FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(formId)
                  )
                : undefined;

            queryClient.setQueryData<FeedbackQuestion>(
                FEEDBACK_QUESTION_QUERY_KEYS.detail(id),
                (old) => (old ? { ...old, ...updateData } : old)
            );

            if (formId) {
                queryClient.setQueryData<FeedbackQuestion[]>(
                    FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(formId),
                    (old) =>
                        old?.map((q) =>
                            q.id === id ? { ...q, ...updateData } : q
                        )
                );
            }

            return { previousQuestion, previousQuestionsList };
        },
        onError: (err, variables, context) => {
            showToast.error(
                `Failed optimistic update for question ID ${variables.id}: ` +
                    err
            );
            if (context?.previousQuestion) {
                queryClient.setQueryData(
                    FEEDBACK_QUESTION_QUERY_KEYS.detail(variables.id),
                    context.previousQuestion
                );
            }
            if (
                context?.previousQuestionsList &&
                context.previousQuestion?.formId
            ) {
                queryClient.setQueryData(
                    FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(
                        context.previousQuestion.formId
                    ),
                    context.previousQuestionsList
                );
            }
        },
        onSettled: (data, error, variables) => {
            const formId =
                (data as FeedbackQuestion)?.formId ||
                (error as any)?.response?.data?.formId ||
                (variables as any)?.formId;
            if (formId) {
                queryClient.invalidateQueries({
                    queryKey: FEEDBACK_QUESTION_QUERY_KEYS.detail(variables.id),
                });
                queryClient.invalidateQueries({
                    queryKey: FEEDBACK_QUESTION_QUERY_KEYS.listsByForm(formId),
                });
                queryClient.invalidateQueries({
                    queryKey: ["feedbackForms", formId],
                });
            } else {
                queryClient.invalidateQueries({
                    queryKey: FEEDBACK_QUESTION_QUERY_KEYS.all,
                });
            }
        },
    });
};

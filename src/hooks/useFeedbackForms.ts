/**
@file src/hooks/useFeedbackForms.ts
@description React Query hooks for feedback form data management
*/

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import feedbackFormService from "@/services/feedbackFormService";
import {
  FeedbackForm,
  GenerateFormsData,
  AddQuestionToFormInput,
  UpdateFormData,
  UpdateFormStatusData,
  BulkUpdateFormStatusData,
} from "@/interfaces/feedbackForm";
import { IdType } from "@/interfaces/common";

// Query keys
export const FEEDBACK_FORM_QUERY_KEYS = {
  all: ["feedbackForms"] as const,
  lists: () => [...FEEDBACK_FORM_QUERY_KEYS.all, "list"] as const,
  detail: (id: IdType) => [...FEEDBACK_FORM_QUERY_KEYS.all, id] as const,
  byAccessToken: (token: string) =>
    [...FEEDBACK_FORM_QUERY_KEYS.all, "access", token] as const,
};

// Get all feedback forms
export const useAllFeedbackForms = () =>
  useQuery<FeedbackForm[], Error>({
    queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
    queryFn: feedbackFormService.getAllForms,
  });

// Get feedback form by ID
export const useFeedbackForm = (id: IdType) =>
  useQuery<FeedbackForm, Error>({
    queryKey: FEEDBACK_FORM_QUERY_KEYS.detail(id),
    queryFn: () => feedbackFormService.getFormById(id),
    enabled: !!id,
  });

// Get feedback form by access token
export const useFeedbackFormByAccessToken = (token: string) =>
  useQuery<FeedbackForm, Error>({
    queryKey: FEEDBACK_FORM_QUERY_KEYS.byAccessToken(token),
    queryFn: () => feedbackFormService.getFormByAccessToken(token),
    enabled: !!token,
    staleTime: Infinity,
    gcTime: 5 * 60 * 1000,
  });

// Generate feedback forms
export const useGenerateFeedbackForms = () => {
  const queryClient = useQueryClient();
  return useMutation<FeedbackForm[], Error, GenerateFormsData>({
    mutationFn: feedbackFormService.generateForms,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
    },
  });
};

// Update feedback form with optimistic update
export const useUpdateFeedbackForm = () => {
  const queryClient = useQueryClient();
  return useMutation<
    FeedbackForm,
    Error,
    { id: IdType; data: UpdateFormData },
    {
      previousForm: FeedbackForm | undefined;
      previousFormsList: FeedbackForm[] | undefined;
    }
  >({
    mutationFn: ({ id, data }) => feedbackFormService.updateForm(id, data),
    onSuccess: (updatedForm) => {
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.detail(updatedForm.id),
      });
      queryClient.setQueryData<FeedbackForm>(
        FEEDBACK_FORM_QUERY_KEYS.detail(updatedForm.id),
        updatedForm,
      );
    },
    onMutate: async ({ id, data: updateData }) => {
      await queryClient.cancelQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.detail(id),
      });
      await queryClient.cancelQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
      const previousForm = queryClient.getQueryData<FeedbackForm>(
        FEEDBACK_FORM_QUERY_KEYS.detail(id),
      );
      const previousFormsList = queryClient.getQueryData<FeedbackForm[]>(
        FEEDBACK_FORM_QUERY_KEYS.lists(),
      );
      queryClient.setQueryData<FeedbackForm>(
        FEEDBACK_FORM_QUERY_KEYS.detail(id),
        (old) => (old ? { ...old, ...updateData } : old),
      );
      queryClient.setQueryData<FeedbackForm[]>(
        FEEDBACK_FORM_QUERY_KEYS.lists(),
        (old) =>
          old?.map((form) =>
            form.id === id ? { ...form, ...updateData } : form,
          ),
      );
      return { previousForm, previousFormsList };
    },
    onError: (_err, variables, context) => {
      if (context?.previousForm) {
        queryClient.setQueryData(
          FEEDBACK_FORM_QUERY_KEYS.detail(variables.id),
          context.previousForm,
        );
      }
      if (context?.previousFormsList) {
        queryClient.setQueryData(
          FEEDBACK_FORM_QUERY_KEYS.lists(),
          context.previousFormsList,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
    },
  });
};

// Soft delete feedback form with optimistic update
export const useSoftDeleteFeedbackForm = () => {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    IdType,
    { previousFormsList: FeedbackForm[] | undefined }
  >({
    mutationFn: (id) => feedbackFormService.softDeleteForm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
      queryClient.removeQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.detail(id),
      });
    },
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
      const previousFormsList = queryClient.getQueryData<FeedbackForm[]>(
        FEEDBACK_FORM_QUERY_KEYS.lists(),
      );
      queryClient.setQueryData<FeedbackForm[]>(
        FEEDBACK_FORM_QUERY_KEYS.lists(),
        (old) => old?.filter((form) => form.id !== idToDelete),
      );
      return { previousFormsList };
    },
    onError: (_err, _idToDelete, context) => {
      if (context?.previousFormsList) {
        queryClient.setQueryData(
          FEEDBACK_FORM_QUERY_KEYS.lists(),
          context.previousFormsList,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
    },
  });
};

// Add question to feedback form with optimistic update
export const useAddQuestionToFeedbackForm = () => {
  const queryClient = useQueryClient();
  return useMutation<
    FeedbackForm,
    Error,
    { formId: IdType; questionData: AddQuestionToFormInput },
    { previousForm: FeedbackForm | undefined }
  >({
    mutationFn: ({ formId, questionData }) =>
      feedbackFormService.addQuestionToForm(formId, questionData),
    onSuccess: (updatedForm) => {
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.detail(updatedForm.id),
      });
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
      queryClient.setQueryData<FeedbackForm>(
        FEEDBACK_FORM_QUERY_KEYS.detail(updatedForm.id),
        updatedForm,
      );
    },
    onMutate: async ({ formId }) => {
      await queryClient.cancelQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.detail(formId),
      });
      const previousForm = queryClient.getQueryData<FeedbackForm>(
        FEEDBACK_FORM_QUERY_KEYS.detail(formId),
      );
      queryClient.setQueryData<FeedbackForm>(
        FEEDBACK_FORM_QUERY_KEYS.detail(formId),
        (old) => old,
      );
      return { previousForm };
    },
    onError: (_err, variables, context) => {
      if (context?.previousForm) {
        queryClient.setQueryData(
          FEEDBACK_FORM_QUERY_KEYS.detail(variables.formId),
          context.previousForm,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.detail(variables.formId),
      });
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
    },
  });
};

// Update feedback form status with optimistic update
export const useUpdateFeedbackFormStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<
    FeedbackForm,
    Error,
    { formId: IdType; statusData: UpdateFormStatusData },
    {
      previousForm: FeedbackForm | undefined;
      previousFormsList: FeedbackForm[] | undefined;
    }
  >({
    mutationFn: ({ formId, statusData }) =>
      feedbackFormService.updateFormStatus(formId, statusData),
    onSuccess: (updatedForm) => {
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.detail(updatedForm.id),
      });
      queryClient.setQueryData<FeedbackForm>(
        FEEDBACK_FORM_QUERY_KEYS.detail(updatedForm.id),
        updatedForm,
      );
    },
    onMutate: async ({ formId, statusData }) => {
      await queryClient.cancelQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.detail(formId),
      });
      await queryClient.cancelQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
      const previousForm = queryClient.getQueryData<FeedbackForm>(
        FEEDBACK_FORM_QUERY_KEYS.detail(formId),
      );
      const previousFormsList = queryClient.getQueryData<FeedbackForm[]>(
        FEEDBACK_FORM_QUERY_KEYS.lists(),
      );
      queryClient.setQueryData<FeedbackForm>(
        FEEDBACK_FORM_QUERY_KEYS.detail(formId),
        (old) => (old ? { ...old, ...statusData } : old),
      );
      queryClient.setQueryData<FeedbackForm[]>(
        FEEDBACK_FORM_QUERY_KEYS.lists(),
        (old) =>
          old?.map((form) =>
            form.id === formId ? { ...form, ...statusData } : form,
          ),
      );
      return { previousForm, previousFormsList };
    },
    onError: (_err, variables, context) => {
      if (context?.previousForm) {
        queryClient.setQueryData(
          FEEDBACK_FORM_QUERY_KEYS.detail(variables.formId),
          context.previousForm,
        );
      }
      if (context?.previousFormsList) {
        queryClient.setQueryData(
          FEEDBACK_FORM_QUERY_KEYS.lists(),
          context.previousFormsList,
        );
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.detail(variables.formId),
      });
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
    },
  });
};

// Bulk update feedback form status
export const useBulkUpdateFeedbackFormStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<FeedbackForm[], Error, BulkUpdateFormStatusData>({
    mutationFn: feedbackFormService.bulkUpdateFormStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: FEEDBACK_FORM_QUERY_KEYS.lists(),
      });
    },
  });
};

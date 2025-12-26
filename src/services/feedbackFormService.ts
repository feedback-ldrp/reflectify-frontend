/**
 * @file src/services/feedbackFormService.ts
 * @description Handles API requests related to feedback forms.
 */

import axiosInstance from "@/lib/axiosInstance";
import { FEEDBACK_FORM_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  FeedbackForm,
  GenerateFormsData,
  AddQuestionToFormInput,
  UpdateFormData,
  UpdateFormStatusData,
  BulkUpdateFormStatusData,
} from "@/interfaces/feedbackForm";
import { ApiResponse, IdType } from "@/interfaces/common";

const feedbackFormService = {
  // Generate feedback forms based on department and selected semesters/divisions
  generateForms: async (
    generationData: GenerateFormsData,
  ): Promise<FeedbackForm[]> => {
    const response = await axiosInstance.post<
      ApiResponse<{ forms: FeedbackForm[] }>
    >(FEEDBACK_FORM_ENDPOINTS.GENERATE, generationData);
    return response.data.data.forms;
  },

  // Retrieve all active feedback forms
  getAllForms: async (): Promise<FeedbackForm[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ forms: FeedbackForm[] }>
    >(FEEDBACK_FORM_ENDPOINTS.BASE);
    return response.data.data.forms;
  },

  // Retrieve a single feedback form by ID
  getFormById: async (id: IdType): Promise<FeedbackForm> => {
    const response = await axiosInstance.get<
      ApiResponse<{ form: FeedbackForm }>
    >(FEEDBACK_FORM_ENDPOINTS.getById(id));
    return response.data.data.form;
  },

  // Update an existing feedback form
  updateForm: async (
    id: IdType,
    updateData: UpdateFormData,
  ): Promise<FeedbackForm> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ form: FeedbackForm }>
    >(FEEDBACK_FORM_ENDPOINTS.getById(id), updateData);
    return response.data.data.form;
  },

  // Soft delete a feedback form
  softDeleteForm: async (id: IdType): Promise<void> => {
    await axiosInstance.delete(FEEDBACK_FORM_ENDPOINTS.getById(id));
  },

  // Add a new question to an existing feedback form
  addQuestionToForm: async (
    formId: IdType,
    questionData: AddQuestionToFormInput,
  ): Promise<FeedbackForm> => {
    const response = await axiosInstance.post<
      ApiResponse<{ form: FeedbackForm }>
    >(FEEDBACK_FORM_ENDPOINTS.ADD_QUESTION(formId), questionData);
    return response.data.data.form;
  },

  // Update the status and dates of a single feedback form
  updateFormStatus: async (
    formId: IdType,
    statusData: UpdateFormStatusData,
  ): Promise<FeedbackForm> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ form: FeedbackForm }>
    >(FEEDBACK_FORM_ENDPOINTS.UPDATE_FORM_DATA(formId), statusData);
    return response.data.data.form;
  },

  // Bulk update the status and dates for multiple feedback forms
  bulkUpdateFormStatus: async (
    bulkStatusData: BulkUpdateFormStatusData,
  ): Promise<FeedbackForm[]> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ forms: FeedbackForm[] }>
    >(FEEDBACK_FORM_ENDPOINTS.BULK_UPDATE_STATUS, bulkStatusData);
    return response.data.data.forms;
  },

  // Retrieve a feedback form using an access token (public route)
  getFormByAccessToken: async (token: string): Promise<FeedbackForm> => {
    const response = await axiosInstance.get<
      ApiResponse<{ form: FeedbackForm }>
    >(FEEDBACK_FORM_ENDPOINTS.ACCESS_BY_TOKEN(token));
    return response.data.data.form;
  },
};

export default feedbackFormService;

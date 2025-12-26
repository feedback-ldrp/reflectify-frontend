/**
 * @file src/services/feedbackQuestionService.ts
 * @description Handles API requests related to feedback questions and categories.
 */

import axiosInstance from "@/lib/axiosInstance";
import { FEEDBACK_QUESTION_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  QuestionCategory,
  CreateQuestionCategoryData,
  UpdateQuestionCategoryData,
} from "@/interfaces/questionCategory";
import {
  FeedbackQuestion,
  CreateFeedbackQuestionData,
  UpdateFeedbackQuestionData,
  BatchUpdateFeedbackQuestionItem,
} from "@/interfaces/feedbackQuestion";
import { ApiResponse, IdType } from "@/interfaces/common";

const feedbackQuestionService = {
  // Retrieve all active question categories
  getAllQuestionCategories: async (): Promise<QuestionCategory[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ categories: QuestionCategory[] }>
    >(FEEDBACK_QUESTION_ENDPOINTS.CATEGORIES);
    return response.data.data.categories;
  },

  // Retrieve a single question category by ID
  getQuestionCategoryById: async (id: IdType): Promise<QuestionCategory> => {
    const response = await axiosInstance.get<
      ApiResponse<{ category: QuestionCategory }>
    >(FEEDBACK_QUESTION_ENDPOINTS.getCategoryById(id));
    return response.data.data.category;
  },

  // Create a new question category
  createQuestionCategory: async (
    categoryData: CreateQuestionCategoryData,
  ): Promise<QuestionCategory> => {
    const response = await axiosInstance.post<
      ApiResponse<{ category: QuestionCategory }>
    >(FEEDBACK_QUESTION_ENDPOINTS.CATEGORIES, categoryData);
    return response.data.data.category;
  },

  // Update an existing question category
  updateQuestionCategory: async (
    id: IdType,
    updateData: UpdateQuestionCategoryData,
  ): Promise<QuestionCategory> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ category: QuestionCategory }>
    >(FEEDBACK_QUESTION_ENDPOINTS.getCategoryById(id), updateData);
    return response.data.data.category;
  },

  // Soft delete a question category
  softDeleteQuestionCategory: async (id: IdType): Promise<void> => {
    await axiosInstance.delete(FEEDBACK_QUESTION_ENDPOINTS.getCategoryById(id));
  },

  // Create a new feedback question for a specific form
  createFeedbackQuestion: async (
    formId: IdType,
    questionData: Omit<CreateFeedbackQuestionData, "formId">,
  ): Promise<FeedbackQuestion> => {
    const payload = { ...questionData, formId };
    const response = await axiosInstance.post<
      ApiResponse<{ question: FeedbackQuestion }>
    >(FEEDBACK_QUESTION_ENDPOINTS.QUESTIONS_BY_FORM(formId), payload);
    return response.data.data.question;
  },

  // Update an existing feedback question
  updateFeedbackQuestion: async (
    id: IdType,
    updateData: UpdateFeedbackQuestionData,
  ): Promise<FeedbackQuestion> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ question: FeedbackQuestion }>
    >(FEEDBACK_QUESTION_ENDPOINTS.getQuestionById(id), updateData);
    return response.data.data.question;
  },

  // Soft delete a feedback question
  softDeleteFeedbackQuestion: async (id: IdType): Promise<void> => {
    await axiosInstance.delete(FEEDBACK_QUESTION_ENDPOINTS.getQuestionById(id));
  },

  // Retrieve active feedback questions for a specific form
  getFeedbackQuestionsByFormId: async (
    formId: IdType,
  ): Promise<FeedbackQuestion[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ questions: FeedbackQuestion[] }>
    >(FEEDBACK_QUESTION_ENDPOINTS.QUESTIONS_BY_FORM(formId));
    return response.data.data.questions;
  },

  // Batch update feedback questions
  batchUpdateFeedbackQuestions: async (
    questions: BatchUpdateFeedbackQuestionItem[],
  ): Promise<FeedbackQuestion[]> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ questions: FeedbackQuestion[] }>
    >(FEEDBACK_QUESTION_ENDPOINTS.BATCH_UPDATE_QUESTIONS, { questions });
    return response.data.data.questions;
  },
};

export default feedbackQuestionService;

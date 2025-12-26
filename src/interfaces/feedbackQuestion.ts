/**
 * @file src/interfaces/feedbackQuestion.ts
 * @description Interfaces for Feedback Question entity and related API data
 */

import { IdType } from "./common";
import { QuestionCategory } from "./questionCategory";

/**
 * Supported question types for feedback questions.
 */
export type QuestionType = "RATING" | "TEXT" | "MULTIPLE_CHOICE" | "BOOLEAN";

/**
 * Represents a feedback question entity.
 */
export interface FeedbackQuestion {
  id: IdType;
  formId: IdType;
  categoryId: IdType;
  facultyId: IdType;
  subjectId: IdType;
  batch?: string;
  text: string;
  type: QuestionType;
  isRequired?: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  category?: QuestionCategory;
  faculty?: any; // TODO: Replace 'any' with Faculty interface if needed
  subject?: any; // TODO: Replace 'any' with Subject interface if needed
}

/**
 * Data required to create a new feedback question.
 */
export interface CreateFeedbackQuestionData {
  formId: IdType;
  categoryId: IdType;
  facultyId: IdType;
  subjectId: IdType;
  batch?: string;
  text: string;
  type: QuestionType;
  isRequired?: boolean;
  displayOrder: number;
}

/**
 * Data for updating an existing feedback question (all fields optional).
 */
export interface UpdateFeedbackQuestionData {
  categoryId?: IdType;
  facultyId?: IdType;
  subjectId?: IdType;
  batch?: string;
  text?: string;
  type?: QuestionType;
  isRequired?: boolean;
  displayOrder?: number;
  isDeleted?: boolean;
}

/**
 * Data structure for a single item in a batch update request.
 */
export interface BatchUpdateFeedbackQuestionItem {
  id: IdType;
  data: UpdateFeedbackQuestionData;
}

/**
 * Data structure for the entire batch update request body.
 */
export interface BatchUpdateFeedbackQuestionsData {
  questions: BatchUpdateFeedbackQuestionItem[];
}

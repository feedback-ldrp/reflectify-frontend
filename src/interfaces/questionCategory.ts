/**
 * @file src/interfaces/questionCategory.ts
 * @description Interfaces for Question Category entity and related API data
 */

import { IdType } from "./common";

/**
 * Represents a question category entity.
 */
export interface QuestionCategory {
  id: IdType;
  categoryName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface SimpleQuestionCategory {
  id: IdType;
  name: string;
}

/**
 * Data required to create a new question category.
 */
export interface CreateQuestionCategoryData {
  name: string;
  description?: string;
}

/**
 * Data for updating an existing question category (all fields optional).
 */
export interface UpdateQuestionCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

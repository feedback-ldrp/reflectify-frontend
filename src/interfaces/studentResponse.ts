/**
 * @file src/interfaces/studentResponse.ts
 * @description Interfaces for student response data and related API data
 */

import { IdType } from "./common";

/**
 * The type for the value of a student's response.
 */
export type StudentResponseValue = string | number | boolean;

/**
 * Represents a single student's response to a question.
 */
export interface SubmitResponseItem {
  feedbackQuestionId: IdType;
  value: StudentResponseValue;
}

/**
 * Data structure for submitting multiple student responses.
 */
export type SubmitResponsesData = SubmitResponseItem[];

/**
 * Data structure for the response from checking submission status.
 */
export interface CheckSubmissionStatus {
  isSubmitted: boolean;
}

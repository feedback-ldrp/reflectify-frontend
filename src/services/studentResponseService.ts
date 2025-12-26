/**
 * @file src/services/studentResponseService.ts
 * @description Service for student feedback response API operations
 */

import axiosInstance from "@/lib/axiosInstance";
import { STUDENT_RESPONSE_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  SubmitResponsesData,
  SubmitResponseItem,
  CheckSubmissionStatus,
} from "@/interfaces/studentResponse";
import { ApiResponse } from "@/interfaces/common";

const studentResponseService = {
  // Submit student responses for a feedback form using an access token
  submitResponses: async (
    token: string,
    responses: SubmitResponsesData,
  ): Promise<SubmitResponseItem[]> => {
    const response = await axiosInstance.post<
      ApiResponse<{ responses: SubmitResponseItem[] }>
    >(STUDENT_RESPONSE_ENDPOINTS.SUBMIT_RESPONSES(token), responses);
    return response.data.data.responses;
  },

  // Check the submission status of a feedback form using an access token
  checkSubmission: async (token: string): Promise<CheckSubmissionStatus> => {
    const response = await axiosInstance.get<
      ApiResponse<CheckSubmissionStatus>
    >(STUDENT_RESPONSE_ENDPOINTS.CHECK_SUBMISSION(token));
    return response.data.data;
  },
};

export default studentResponseService;

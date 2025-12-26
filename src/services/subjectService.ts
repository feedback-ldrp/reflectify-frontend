/**
 * @file src/services/subjectService.ts
 * @description Service for subject API operations
 */

import axiosInstance from "@/lib/axiosInstance";
import { SUBJECT_ENDPOINTS } from "@/constants/apiEndpoints";
import {
  Subject,
  CreateSubjectData,
  UpdateSubjectData,
  SubjectAbbreviation,
} from "@/interfaces/subject";
import { ApiResponse, IdType } from "@/interfaces/common";

const subjectService = {
  // Get all subjects
  getAllSubjects: async (): Promise<Subject[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ subjects: Subject[] }>
    >(SUBJECT_ENDPOINTS.BASE);
    return response.data.data.subjects;
  },

  // Get a single subject by ID
  getSubjectById: async (id: IdType): Promise<Subject> => {
    const response = await axiosInstance.get<ApiResponse<{ subject: Subject }>>(
      SUBJECT_ENDPOINTS.getById(id),
    );
    return response.data.data.subject;
  },

  // Create a new subject
  createSubject: async (subjectData: CreateSubjectData): Promise<Subject> => {
    const response = await axiosInstance.post<
      ApiResponse<{ subject: Subject }>
    >(SUBJECT_ENDPOINTS.BASE, subjectData);
    return response.data.data.subject;
  },

  // Update an existing subject
  updateSubject: async (
    id: IdType,
    updateData: UpdateSubjectData,
  ): Promise<Subject> => {
    const response = await axiosInstance.patch<
      ApiResponse<{ subject: Subject }>
    >(SUBJECT_ENDPOINTS.getById(id), updateData);
    return response.data.data.subject;
  },

  // Soft delete a subject
  softDeleteSubject: async (id: IdType): Promise<void> => {
    await axiosInstance.delete(SUBJECT_ENDPOINTS.getById(id));
  },

  // Get subjects by semester ID
  getSubjectsBySemester: async (semesterId: IdType): Promise<Subject[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ subjects: Subject[] }>
    >(SUBJECT_ENDPOINTS.getBySemester(semesterId));
    return response.data.data.subjects;
  },

  // Get subject abbreviations, optionally filtered by department abbreviation
  getSubjectAbbreviations: async (
    deptAbbr?: string,
  ): Promise<SubjectAbbreviation[]> => {
    const response = await axiosInstance.get<
      ApiResponse<{ abbreviations: SubjectAbbreviation[] }>
    >(SUBJECT_ENDPOINTS.getAbbreviations(deptAbbr));
    return response.data.data.abbreviations;
  },

  // Batch create subjects
  batchCreateSubjects: async (
    subjects: CreateSubjectData[],
  ): Promise<Subject[]> => {
    const response = await axiosInstance.post<
      ApiResponse<{ subjects: Subject[] }>
    >(SUBJECT_ENDPOINTS.BATCH, { subjects });
    return response.data.data.subjects;
  },
};

export default subjectService;

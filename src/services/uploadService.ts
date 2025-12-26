/**
 * @file src/services/uploadService.ts
 * @description Service for file upload API operations
 */

import axiosInstance from "@/lib/axiosInstance";
import { UPLOAD_ENDPOINTS } from "@/constants/apiEndpoints";
import { UploadResult, FacultyMatrixUploadResult } from "@/interfaces/upload";
import { SemesterTypeEnum } from "@/constants/semesterTypes";
import { FILE_ROUTES } from "@/constants/fileUploadRoutes";

const uploadService = {
  // Upload and process student data from an Excel file
  uploadStudentData: async (file: File | Blob): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post<UploadResult>(
      UPLOAD_ENDPOINTS.UPLOAD_STUDENT_DATA,
      formData,
    );
    return response.data;
  },

  // Upload and process subject data from an Excel file
  uploadSubjectData: async (file: File | Blob): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post<UploadResult>(
      UPLOAD_ENDPOINTS.UPLOAD_SUBJECT_DATA,
      formData,
    );
    return response.data;
  },

  // Upload and process faculty matrix data from an Excel file
  uploadFacultyMatrix: async (
    file: File | Blob,
    academicYear: string,
    semesterRun: SemesterTypeEnum,
    deptAbbreviation: string,
  ): Promise<FacultyMatrixUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("academicYear", academicYear);
    formData.append("semesterRun", semesterRun);
    formData.append("deptAbbreviation", deptAbbreviation);
    const response = await axiosInstance.post<FacultyMatrixUploadResult>(
      UPLOAD_ENDPOINTS.UPLOAD_FACULTY_MATRIX,
      formData,
    );
    return response.data;
  },

  // Handle the upload of an Excel file to a specified backend endpoint
  uploadFile: async (
    fileKey: keyof typeof FILE_ROUTES,
    file: File,
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post<UploadResult>(
      FILE_ROUTES[fileKey].route,
      formData,
    );
    return response.data;
  },
};

export default uploadService;

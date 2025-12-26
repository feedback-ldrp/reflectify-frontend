/**
@file src/constants/apiEndpoints.ts
@description API endpoint constants for all backend routes
*/

// Environment and base URLs
export const API_ENV = process.env.NEXT_PUBLIC_API_ENV || "production";

export const NEXT_PUBLIC_BACKEND_DEV_URL =
    process.env.NEXT_PUBLIC_BACKEND_DEV_URL || "http://localhost:4000";

export const NEXT_PUBLIC_BACKEND_API_URL =
    process.env.NEXT_PUBLIC_BACKEND_API_URL ||
    "https://reflectify-backend.onrender.com";

export const BASE_URL =
    API_ENV === "development"
        ? NEXT_PUBLIC_BACKEND_DEV_URL
        : NEXT_PUBLIC_BACKEND_API_URL;

export const API_V1_URL = `${BASE_URL}/api/v1`;

// Reference file URLs for uploads
export const REFERENCE_FILE_URLS = {
    FACULTY_MATRIX:
        process.env.FACULTY_MATRIX_REFERENCE_FILE_URL ||
        "https://docs.google.com/spreadsheets/d/1yp61h5vitWgAw_BYieZLtE-Sp52tK8Rr/edit?usp=sharing&ouid=105338775516938942439&rtpof=true&sd=true",
    STUDENT_DATA:
        process.env.STUDENT_DATA_REFERENCE_FILE_URL ||
        "https://docs.google.com/spreadsheets/d/19scpTIj9cbXEM_2FHArGdeGFFBD2a78u/edit?usp=sharing&ouid=105338775516938942439&rtpof=true&sd=true",
    FACULTY_DATA:
        process.env.FACULTY_DATA_REFERENCE_FILE_URL ||
        "https://docs.google.com/spreadsheets/d/1sZ9r6jbZQTytChQUgur3wJXWp254eOts/edit?usp=sharing&ouid=105338775516938942439&rtpof=true&sd=true",
    SUBJECT_DATA:
        process.env.SUBJECT_DATA_REFERENCE_FILE_URL ||
        "https://docs.google.com/spreadsheets/d/1yeZx1qBArpu0feg-xyXTDmsbOmC04Yvv/edit?usp=sharing&ouid=105338775516938942439&rtpof=true&sd=true",
};

// Authentication endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: `${API_V1_URL}/auth/login`,
    REGISTER: `${API_V1_URL}/auth/register`,
    SUPER_REGISTER: `${API_V1_URL}/auth/super-register`,
    ME: `${API_V1_URL}/auth/me`,
    UPDATE_PASSWORD: `${API_V1_URL}/auth/update-password`,
};

// Dashboard endpoints
export const DASHBOARD_ENDPOINTS = {
    STATS: `${API_V1_URL}/dashboard/stats`,
    DELETE_ALL_DATA: `${API_V1_URL}/dashboard/delete-all-data`,
};

// Faculty management endpoints
export const FACULTY_ENDPOINTS = {
    BASE: `${API_V1_URL}/faculties`,
    getById: (id: string | number) => `${API_V1_URL}/faculties/${id}`,
    BATCH: `${API_V1_URL}/faculties/batch`,
    getAbbreviations: (deptAbbr?: string) =>
        deptAbbr
            ? `${API_V1_URL}/faculties/abbreviations/${deptAbbr}`
            : `${API_V1_URL}/faculties/abbreviations`,
};

// Department management endpoints
export const DEPARTMENT_ENDPOINTS = {
    BASE: `${API_V1_URL}/departments`,
    getById: (id: string | number) => `${API_V1_URL}/departments/${id}`,
    BATCH: `${API_V1_URL}/departments/batch`,
};

// Student management endpoints
export const STUDENT_ENDPOINTS = {
    BASE: `${API_V1_URL}/students`,
    getById: (id: string | number) => `${API_V1_URL}/students/${id}`,
    BATCH: `${API_V1_URL}/students/batch`,
};

// Subject management endpoints
export const SUBJECT_ENDPOINTS = {
    BASE: `${API_V1_URL}/subjects`,
    getById: (id: string | number) => `${API_V1_URL}/subjects/${id}`,
    getBySemester: (semesterId: string | number) =>
        `${API_V1_URL}/subjects/semester/${semesterId}`,
    getAbbreviations: (deptAbbr?: string) =>
        deptAbbr
            ? `${API_V1_URL}/subjects/abbreviations/${deptAbbr}`
            : `${API_V1_URL}/subjects/abbreviations`,
    BATCH: `${API_V1_URL}/subjects/batch`,
};

// College management endpoints
export const COLLEGE_ENDPOINTS = {
    BASE: `${API_V1_URL}/colleges`,
    PRIMARY: `${API_V1_URL}/colleges/primary`,
    BATCH_UPDATE_PRIMARY: `${API_V1_URL}/colleges/primary/batch-update`,
};

// Academic year endpoints
export const ACADEMIC_YEAR_ENDPOINTS = {
    BASE: `${API_V1_URL}/academic-years`,
    getById: (id: string | number) => `${API_V1_URL}/academic-years/${id}`,
    ACTIVE: `${API_V1_URL}/academic-years/active`,
};

// Academic structure endpoints
export const ACADEMIC_STRUCTURE_ENDPOINTS = {
    BASE: `${API_V1_URL}/academic-structure`,
};

// Database management endpoints
export const DATABASE_ENDPOINTS = {
    CLEAN: `${API_V1_URL}/database/clean`,
};

// Division management endpoints
export const DIVISION_ENDPOINTS = {
    BASE: `${API_V1_URL}/divisions`,
    getById: (id: string | number) => `${API_V1_URL}/divisions/${id}`,
    BATCH: `${API_V1_URL}/divisions/batch`,
};

// Email management endpoints
export const EMAIL_ENDPOINTS = {
    SEND_FORM_ACCESS: `${API_V1_URL}/emails/send-form-access`,
};

// Subject allocation endpoints
export const SUBJECT_ALLOCATION_ENDPOINTS = {
    BASE: `${API_V1_URL}/subject-allocations`,
    getById: (id: string | number) => `${API_V1_URL}/subject-allocations/${id}`,
};

// Feedback form endpoints
export const FEEDBACK_FORM_ENDPOINTS = {
    BASE: `${API_V1_URL}/feedback-forms`,
    getById: (id: string | number) => `${API_V1_URL}/feedback-forms/${id}`,
    GENERATE: `${API_V1_URL}/feedback-forms/generate`,
    ADD_QUESTION: (id: string | number) =>
        `${API_V1_URL}/feedback-forms/${id}/questions`,
    UPDATE_FORM_DATA: (id: string | number) =>
        `${API_V1_URL}/feedback-forms/${id}/details`,
    BULK_UPDATE_STATUS: `${API_V1_URL}/feedback-forms/bulk-status`,
    ACCESS_BY_TOKEN: (token: string) =>
        `${API_V1_URL}/feedback-forms/access/${token}`,
    OVERRIDE_STUDENTS: (id: string | number) =>
        `${API_V1_URL}/feedback-forms/${id}/override-students`,
    OVERRIDE_STUDENTS_ALL: (id: string | number) =>
        `${API_V1_URL}/feedback-forms/${id}/override-students/all`,
    OVERRIDE_STUDENTS_COUNT: (id: string | number) =>
        `${API_V1_URL}/feedback-forms/${id}/override-students/count`,
    OVERRIDE_STUDENTS_UPLOAD: (id: string | number) =>
        `${API_V1_URL}/feedback-forms/${id}/override-students/upload`,
    OVERRIDE_STUDENT: (formId: string | number, studentId: string | number) =>
        `${API_V1_URL}/feedback-forms/${formId}/override-students/${studentId}`,
};

// Semester management endpoints
export const SEMESTER_ENDPOINTS = {
    BASE: `${API_V1_URL}/semesters`,
    getById: (id: string | number) => `${API_V1_URL}/semesters/${id}`,
    BATCH: `${API_V1_URL}/semesters/batch`,
    GET_BY_DEPARTMENT: (departmentId: string | number) =>
        `${API_V1_URL}/semesters/dept/${departmentId}`,
};

// Feedback question endpoints
export const FEEDBACK_QUESTION_ENDPOINTS = {
    BASE: `${API_V1_URL}/feedback-questions`,
    CATEGORIES: `${API_V1_URL}/feedback-questions/categories`,
    getCategoryById: (id: string | number) =>
        `${API_V1_URL}/feedback-questions/categories/${id}`,
    QUESTIONS_BY_FORM: (formId: string | number) =>
        `${API_V1_URL}/feedback-questions/form/${formId}/questions`,
    getQuestionById: (id: string | number) =>
        `${API_V1_URL}/feedback-questions/questions/${id}`,
    BATCH_UPDATE_QUESTIONS: `${API_V1_URL}/feedback-questions/questions/batch`,
};

// Student response endpoints
export const STUDENT_RESPONSE_ENDPOINTS = {
    BASE: `${API_V1_URL}/student-responses`,
    SUBMIT_RESPONSES: (token: string) =>
        `${API_V1_URL}/student-responses/submit/${token}`,
    CHECK_SUBMISSION: (token: string) =>
        `${API_V1_URL}/student-responses/check-submission/${token}`,
};

// Analytics endpoints
export const ANALYTICS_ENDPOINTS = {
    BASE: `${API_V1_URL}/analytics`,
    SEMESTERS_WITH_RESPONSES: `${API_V1_URL}/analytics/semesters-with-responses`,
    OVERALL_SEMESTER_RATING: (semesterId: string | number) =>
        `${API_V1_URL}/analytics/semesters/${semesterId}/overall-rating`,
    SUBJECT_WISE_LECTURE_LAB_RATING: (semesterId: string | number) =>
        `${API_V1_URL}/analytics/semesters/${semesterId}/subject-wise-rating`,
    HIGH_IMPACT_AREAS: (semesterId: string | number) =>
        `${API_V1_URL}/analytics/semesters/${semesterId}/high-impact-areas`,
    DIVISION_BATCH_COMPARISONS: (semesterId: string | number) =>
        `${API_V1_URL}/analytics/semesters/${semesterId}/division-batch-comparisons`,
    LAB_LECTURE_COMPARISON: (semesterId: string | number) =>
        `${API_V1_URL}/analytics/semesters/${semesterId}/lab-lecture-comparison`,
    SEMESTER_TREND_ANALYSIS: `${API_V1_URL}/analytics/semester-trend-analysis`,
    ANNUAL_PERFORMANCE_TREND: `${API_V1_URL}/analytics/annual-performance-trend`,
    GET_FACULTY_PERFORMANCE_YEAR_DATA: (
        facultyId: string | number,
        academicYearId: string | number
    ) =>
        `${API_V1_URL}/analytics/faculty/${facultyId}/performance/${academicYearId}`,
    GET_ALL_FACULTY_PERFORMANCE_DATA: (academicYearId: string | number) =>
        `${API_V1_URL}/analytics/faculty/performance/${academicYearId}`,
    TOTAL_RESPONSES: `${API_V1_URL}/analytics/total-responses`,
    SEMESTER_DIVISIONS_WITH_RESPONSES: `${API_V1_URL}/analytics/semester-divisions-with-responses`,
};

// Visual analytics endpoints
export const VISUAL_ANALYTICS_ENDPOINTS = {
    BASE: `${API_V1_URL}/analytics/visual`,
    GROUPED_BAR_CHART_DATA: (facultyId: string | number) =>
        `${API_V1_URL}/analytics/visual/grouped-bar-chart/${facultyId}`,
    FACULTY_LINE_CHART_DATA: (facultyId: string | number) =>
        `${API_V1_URL}/analytics/visual/line-chart/${facultyId}`,
    FACULTY_RADAR_CHART_DATA: (facultyId: string | number) =>
        `${API_V1_URL}/analytics/visual/radar-chart/${facultyId}`,
    SUBJECT_PERFORMANCE_DATA: (subjectId: string | number) =>
        `${API_V1_URL}/analytics/visual/subject-performance/${subjectId}`,
    UNIQUE_FACULTIES_WITH_RESPONSES: `${API_V1_URL}/analytics/visual/unique-faculties`,
    UNIQUE_SUBJECTS_WITH_RESPONSES: `${API_V1_URL}/analytics/visual/unique-subjects`,
};

// Upload endpoints
export const UPLOAD_ENDPOINTS = {
    BASE: `${API_V1_URL}/upload`,
    UPLOAD_STUDENT_DATA: `${API_V1_URL}/upload/student-data`,
    UPLOAD_FACULTY_DATA: `${API_V1_URL}/upload/faculty-data`,
    UPLOAD_SUBJECT_DATA: `${API_V1_URL}/upload/subject-data`,
    UPLOAD_FACULTY_MATRIX: `${API_V1_URL}/upload/faculty-matrix`,
};

export const CONTACT_ENDPOINTS = {
    BASE: `${API_V1_URL}/contact`,
};

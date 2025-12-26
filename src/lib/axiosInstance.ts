/**
 * @file src/lib/axiosInstance.ts
 * @description Axios instance with interceptors for authentication and error handling
 */

"use client";

import axios from "axios";
import { showToast } from "@/lib/toast";
import { BASE_URL } from "@/constants/apiEndpoints";
import Cookies from "js-cookie";

// Axios instance setup
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Request interceptor for auth and content-type
axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get("authToken");
        if (!config.headers) {
            config.headers = {};
        }
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (
            !config.headers["Content-Type"] &&
            !(config.data instanceof FormData)
        ) {
            config.headers["Content-Type"] = "application/json";
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            const errorMessage =
                data.message || "An unexpected error occurred.";
            switch (status) {
                case 400:
                    showToast.error(`Bad Request: ${errorMessage}`);
                    break;
                case 401:
                    showToast.error(`Unauthorized: Please log in again.`);
                    Cookies.remove("authToken");
                    window.location.href = "/login";
                    break;
                case 403:
                    showToast.error(`Forbidden: You don't have permission.`);
                    break;
                case 404:
                    showToast.error(
                        `Not Found: The resource could not be found.`
                    );
                    break;
                case 500:
                    showToast.error(`Server Error: ${errorMessage}`);
                    break;
                default:
                    showToast.error(`Error ${status}: ${errorMessage}`);
            }
        } else if (error.request) {
            showToast.error(
                "No response from server. Check internet or try again."
            );
        } else {
            showToast.error(`Request Error: ${error.message}`);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

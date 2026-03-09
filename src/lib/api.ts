import axiosInstance from "./axiosInstance";

const api = {
  get: (url: string, config?: any) => axiosInstance.get(url, config),
  post: (url: string, data?: any, config?: any) => axiosInstance.post(url, data, config),
  patch: (url: string, data?: any, config?: any) => axiosInstance.patch(url, data, config),
  delete: (url: string, config?: any) => axiosInstance.delete(url, config),
};

export default api;

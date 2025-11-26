import api from "./axiosInstance";

export const loginApi = (payload) => api.post("/auth/login", payload);
export const registerApi = (payload) => api.post("/auth/register", payload);
export const getSections = () => api.get("/sections");
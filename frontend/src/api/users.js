import api from "./axiosInstance";

export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, payload) => api.put(`/users/${id}`, payload);

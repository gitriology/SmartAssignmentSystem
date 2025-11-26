import api from "./axiosInstance";

export const submitAssignment = (id, formData) =>
  api.post(`/assignments/${id}/submissions`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const mySubmissions = () => api.get("/submissions/my");
export const getSubmission = (id) => api.get(`/submissions/${id}`);
export const gradeSubmission = (id, payload) =>
  api.put(`/submissions/${id}/grade`, payload);
export const resubmit = (id, formData) =>
  api.put(`/submissions/${id}/resubmit`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

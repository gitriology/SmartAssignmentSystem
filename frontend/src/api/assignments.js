// src/api/assignments.js
import api from "./axiosInstance";

// Assignments APIs
export const createAssignment = (formData) =>
  api.post("/assignments/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getAllAssignments = () => api.get("/assignments/all");
export const getAssignment = (id) => api.get(`/assignments/${id}`);
export const editAssignment = (id, formData) =>
  api.put(`/assignments/edit/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteAssignment = (id) => api.delete(`/assignments/delete/${id}`);
export const getAllSubmissionsForAssignment = (id) =>
  api.get(`/assignments/${id}/allSubmissions`);

// Submissions APIs
export const submitAssignment = (assignmentId, formData) =>
  api.post(`/assignments/${assignmentId}/submissions`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const mySubmissions = () => api.get("/submissions/my");
export const getSubmission = (id) => api.get(`/submissions/${id}`);
export const gradeSubmission = (id, payload) =>
  api.put(`/submissions/${id}/grade`, payload);

export const resubmit = (submissionId, formData) =>
  api.put(`/submissions/${submissionId}/resubmit`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

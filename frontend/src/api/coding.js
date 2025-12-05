// api/coding.js
import api from "./axiosInstance";

export const getProblems = () => api.get("/coding/problems");
export const getProblem = (id) => api.get(`/coding/problem/${id}`);
export const createProblem = (data) => api.post("/coding/problems", data);

export const runCode = (data) => api.post("/coding/run", data);
export const submitCode = (id, data) => api.post(`/coding/problems/${id}/submit`, data);

export const getMyCodingSubmissions = () => api.get("/coding/my/submissions");
export const getProblemSubmissions = (id) => api.get(`/coding/problems/${id}/submissions`);
export const deleteProblem = (id) => api.delete(`/coding/problems/${id}`);

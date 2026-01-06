import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:3000") + "/api",
});

// Add token to requests if available
const token = localStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// -------------------- Inventory endpoints --------------------

export const getInventory = () => api.get("/inventory");
export const addInventory = (data) => api.post("/inventory", data);
export const deleteInventory = (id) => api.delete(`/inventory/${id}`);
export const updateInventory = (id, data) => api.put(`/inventory/${id}`, data);

// -------------------- Request endpoints --------------------

export const getRequests = () => api.get("/requests");
export const addRequest = (data) => api.post("/requests", data);
export const deleteRequest = (id) => api.delete(`/requests/${id}`);
export const updateRequest = (id, data) => api.put(`/requests/${id}`, data);

// -------------------- Notification endpoints --------------------

export const getNotifications = () => api.get("/notifications");
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// -------------------- Auth endpoints --------------------

export const sendVerificationCode = (email) => api.post("/auth/send-code", { email });
export const verifyCode = (email, code) => api.post("/auth/verify-code", { email, code });
export const createPassword = (email, password) => api.post("/auth/create-password", { email, password });
export const signIn = (email, password) => api.post("/auth/signin", { email, password });
export const getCurrentUser = () => api.get("/auth/me");
export const deleteAccount = () => api.delete("/auth/delete-account");

export default api;

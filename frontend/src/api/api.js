import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

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

export default api;

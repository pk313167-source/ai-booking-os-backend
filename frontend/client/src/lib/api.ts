import axios, { AxiosInstance } from "axios";

const API_BASE_URL = "https://ai-booking-os-backend.onrender.com/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (email: string, password: string, businessName: string) =>
    apiClient.post("/auth/signup", { email, password, businessName }),
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),
};

export const dashboardAPI = {
  getDashboard: () => apiClient.get("/dashboard"),
};

export const contactsAPI = {
  addContact: (name: string, phone: string, email?: string) =>
    apiClient.post("/contacts", { name, phone, email }),
  listContacts: () => apiClient.get("/contacts"),
  editContact: (id: string, data: any) =>
    apiClient.patch(`/contacts/${id}`, data),
};

export const appointmentsAPI = {
  bookAppointment: (contactId: string, startTime: string, endTime: string, title?: string) =>
    apiClient.post("/appointments", { contactId, startTime, endTime, title }),
  listAppointments: () => apiClient.get("/appointments"),
  updateAppointment: (id: string, data: any) =>
    apiClient.patch(`/appointments/${id}`, data),
};

export const chatAPI = {
  sendMessage: (contactPhoneOrEmail: string, message: string) =>
    apiClient.post("/chat", { contactPhoneOrEmail, message }),
  getChatHistory: (contactId: string) =>
    apiClient.get(`/chat/${contactId}`),
};

export const settingsAPI = {
  saveSettings: (data: any) => apiClient.post("/settings", data),
  getSettings: () => apiClient.get("/settings"),
};

export default apiClient;

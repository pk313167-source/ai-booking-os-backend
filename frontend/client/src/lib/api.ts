import axios, { AxiosInstance } from "axios";

// Use environment variable for API URL, fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://ai-booking-os-backend.onrender.com/api";

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
      localStorage.removeItem("user");
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
    apiClient.post("/appointments", { contactId, startTime, endTime }),
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

export const bookingsAPI = {
  createBooking: (data: any) => apiClient.post("/bookings", data),
  listBookings: () => apiClient.get("/bookings"),
  getBooking: (id: string) => apiClient.get(`/bookings/${id}`),
  updateBooking: (id: string, data: any) =>
    apiClient.put(`/bookings/${id}`, data),
  deleteBooking: (id: string) => apiClient.delete(`/bookings/${id}`),
};

export const customersAPI = {
  createCustomer: (data: any) => apiClient.post("/customers", data),
  listCustomers: () => apiClient.get("/customers"),
  getCustomer: (id: string) => apiClient.get(`/customers/${id}`),
  updateCustomer: (id: string, data: any) =>
    apiClient.put(`/customers/${id}`, data),
  deleteCustomer: (id: string) => apiClient.delete(`/customers/${id}`),
};

export const servicesAPI = {
  createService: (data: any) => apiClient.post("/services", data),
  listServices: () => apiClient.get("/services"),
  getService: (id: string) => apiClient.get(`/services/${id}`),
  updateService: (id: string, data: any) =>
    apiClient.put(`/services/${id}`, data),
  deleteService: (id: string) => apiClient.delete(`/services/${id}`),
};

export const staffAPI = {
  createStaff: (data: any) => apiClient.post("/staff", data),
  listStaff: () => apiClient.get("/staff"),
  getStaff: (id: string) => apiClient.get(`/staff/${id}`),
  updateStaff: (id: string, data: any) =>
    apiClient.put(`/staff/${id}`, data),
  deleteStaff: (id: string) => apiClient.delete(`/staff/${id}`),
};

export const profileAPI = {
  getProfile: () => apiClient.get("/auth/profile"),
  updateProfile: (data: any) => apiClient.put("/auth/profile", data),
};

export const paymentsAPI = {
  createOrder: (planId: string) =>
    apiClient.post("/payments/create-checkout-session", { planId }),
  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => apiClient.post("/payments/verify", data),
  getPaymentHistory: () => apiClient.get("/payments/history"),
  getSubscriptionStatus: () =>
    apiClient.get("/payments/subscription-status"),
  getPlans: () => apiClient.get("/payments/plans"),
};

export default apiClient;

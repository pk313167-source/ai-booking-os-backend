import { Router } from "express";
import { 
  signup, 
  login, 
  verifyEmail, 
  forgotPassword, 
  resetPassword 
} from "../controllers/auth.controller";
import { getDashboard } from "../controllers/dashboard.controller";
import { addContact, listContacts, editContact } from "../controllers/contacts.controller";
import { bookAppointment, listAppointments, updateAppointment } from "../controllers/appointments.controller";
import { sendMessage, getChatHistory } from "../controllers/chat.controller";
import { saveSettings, getSettings } from "../controllers/settings.controller";
import { authenticateToken } from "../middleware/auth";
import { body, query } from "express-validator";
import { validate } from "../middleware/validate";

// New core module controllers
import { createService, listServices, getService, updateService, deleteService } from "../controllers/services.controller";
import { createCustomer, listCustomers, getCustomer, updateCustomer, deleteCustomer } from "../controllers/customers.controller";
import { createStaff, listStaff, getStaff, updateStaff, deleteStaff } from "../controllers/staff.controller";
import { createBooking, listBookings, getBooking, updateBooking, deleteBooking } from "../controllers/bookings.controller";
import { getProfile, updateProfile } from "../controllers/profile.controller";

// Payment and notification controllers
import {
  getPlans,
  createPaymentOrder,
  handleWebhook,
  getSubscriptionStatus,
  verifyPayment,
  getPaymentHistory,
} from "../controllers/payments.controller";
import { testEmail } from "../controllers/notifications.controller";

const router = Router();

// Health Check
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Auth
router.post("/auth/signup", [
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  body("businessName").notEmpty(),
  validate
], signup);
router.post("/auth/login", [
  body("email").isEmail(),
  body("password").exists(),
  validate
], login);

router.post("/auth/verify-email", [
  body("token").notEmpty(),
  validate
], verifyEmail);

router.post("/auth/forgot-password", [
  body("email").isEmail(),
  validate
], forgotPassword);

router.post("/auth/reset-password", [
  body("token").notEmpty(),
  body("password").isLength({ min: 6 }),
  validate
], resetPassword);

// User Profile
router.get("/auth/profile", authenticateToken, getProfile);
router.put("/auth/profile", authenticateToken, updateProfile);

// Dashboard
router.get("/dashboard", authenticateToken, getDashboard);

// Contacts
router.post("/contacts", authenticateToken, [
  body("name").notEmpty(),
  body("phone").notEmpty(),
  validate
], addContact);
router.get("/contacts", authenticateToken, listContacts);
router.patch("/contacts/:id", authenticateToken, editContact);

// Appointments
router.post("/appointments", authenticateToken, [
  body("contactId").isUUID(),
  body("startTime").isISO8601(),
  body("endTime").isISO8601(),
  validate
], bookAppointment);
router.get("/appointments", authenticateToken, listAppointments);
router.patch("/appointments/:id", authenticateToken, updateAppointment);

// Chat
router.post("/chat", authenticateToken, [
  body("contactPhoneOrEmail").notEmpty(),
  body("message").notEmpty(),
  validate
], sendMessage);
router.get("/chat/:contactId", authenticateToken, getChatHistory);

// Settings
router.post("/settings", authenticateToken, saveSettings);
router.get("/settings", authenticateToken, getSettings);

// Services
router.post("/services", authenticateToken, [
  body("name").notEmpty().withMessage("Service name is required"),
  body("duration").isInt({ min: 1 }).withMessage("Duration must be a positive integer"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  validate
], createService);
router.get("/services", authenticateToken, listServices);
router.get("/services/:id", authenticateToken, getService);
router.put("/services/:id", authenticateToken, [
  body("duration").optional().isInt({ min: 1 }).withMessage("Duration must be a positive integer"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  validate
], updateService);
router.delete("/services/:id", authenticateToken, deleteService);

// Customers
router.post("/customers", authenticateToken, [
  body("name").notEmpty().withMessage("Customer name is required"),
  body("email").optional().isEmail().withMessage("Invalid email format"),
  validate
], createCustomer);
router.get("/customers", authenticateToken, listCustomers);
router.get("/customers/:id", authenticateToken, getCustomer);
router.put("/customers/:id", authenticateToken, [
  body("email").optional().isEmail().withMessage("Invalid email format"),
  validate
], updateCustomer);
router.delete("/customers/:id", authenticateToken, deleteCustomer);

// Staff
router.post("/staff", authenticateToken, [
  body("name").notEmpty().withMessage("Staff name is required"),
  validate
], createStaff);
router.get("/staff", authenticateToken, listStaff);
router.get("/staff/:id", authenticateToken, getStaff);
router.put("/staff/:id", authenticateToken, updateStaff);
router.delete("/staff/:id", authenticateToken, deleteStaff);

// Bookings
router.post("/bookings", authenticateToken, [
  body("customerId").notEmpty().withMessage("customerId is required"),
  body("date").notEmpty().withMessage("date is required"),
  body("time").notEmpty().withMessage("time is required"),
  body("duration").isInt({ min: 1 }).withMessage("duration must be a positive integer"),
  validate
], createBooking);
router.get("/bookings", authenticateToken, listBookings);
router.get("/bookings/:id", authenticateToken, getBooking);
router.put("/bookings/:id", authenticateToken, [
  body("duration").optional().isInt({ min: 1 }).withMessage("duration must be a positive integer"),
  validate
], updateBooking);
router.delete("/bookings/:id", authenticateToken, deleteBooking);

// Payments
router.get("/payments/plans", getPlans);
router.post("/payments/create-checkout-session", authenticateToken, createPaymentOrder);
router.get("/payments/subscription-status", authenticateToken, getSubscriptionStatus);
router.post("/payments/verify", authenticateToken, verifyPayment);
router.get("/payments/history", authenticateToken, getPaymentHistory);

router.post("/payments/webhook", (req, res, next) => {
  
  handleWebhook(req, res);
});

// Notifications
router.post("/notifications/test-email", authenticateToken, testEmail);

export default router;

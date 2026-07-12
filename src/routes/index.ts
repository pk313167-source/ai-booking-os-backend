import { Router } from "express";
import { signup, login } from "../controllers/auth.controller";
import { getDashboard } from "../controllers/dashboard.controller";
import { addContact, listContacts, editContact } from "../controllers/contacts.controller";
import { bookAppointment, listAppointments, updateAppointment } from "../controllers/appointments.controller";
import { sendMessage, getChatHistory } from "../controllers/chat.controller";
import { saveSettings, getSettings } from "../controllers/settings.controller";
import { authenticateToken } from "../middleware/auth";
import { body } from "express-validator";
import { validate } from "../middleware/validate";

const router = Router();

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

export default router;

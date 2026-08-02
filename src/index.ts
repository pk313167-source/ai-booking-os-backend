import dotenv from "dotenv";
dotenv.config();

import * as Sentry from "@sentry/node";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler } from "./middleware/error";
import { initCronJobs } from "./cron/reminders";

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "production",
    tracesSampleRate: 0.1,
  });
  console.log("Sentry initialized");
}

if (!process.env.JWT_SECRET) {
  console.warn("JWT_SECRET is not defined. Using a dummy secret for now.");
  process.env.JWT_SECRET = "dummy_secret_for_dev_only";
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json());

// Health Check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Routes
app.use("/api", routes);

// Sentry error handler
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Error Handling
app.use(errorHandler);

// Initialize Cron Jobs
try {
    initCronJobs();
} catch (e) {
    console.error("Failed to initialize cron jobs:", e);
}

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

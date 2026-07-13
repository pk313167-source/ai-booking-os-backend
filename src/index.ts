import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
// import routes from "./routes";
// import { errorHandler } from "./middleware/error";
// import { initCronJobs } from "./cron/reminders";

dotenv.config();

if (!process.env.JWT_SECRET) {
  // throw new Error("FATAL ERROR: JWT_SECRET is not defined.");
  console.warn("JWT_SECRET is not defined.");
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
// app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error Handling
// app.use(errorHandler);

// Initialize Cron Jobs
// initCronJobs();

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;

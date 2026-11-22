import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";

import {
  generalRateLimiter,
} from "./middleware/rate-limiter.js";

import errorHandler from "./middleware/error-handler.js";

import authRoutes from "./routes/auth.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import publicContentRoutes from "./routes/public-content.routes.js";
import moderationRoutes from "./routes/moderation.routes.js";

const app = express();

app.set("trust proxy", 1);

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(generalRateLimiter);

app.use(express.json({ limit: "1mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Birthday celebration API is running.",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Administrator authentication.
app.use("/api/auth", authRoutes);

// Public birthday submissions.
app.use("/api/submissions", submissionRoutes);

// Public approved content.
app.use("/api/content", publicContentRoutes);

// Protected administrator moderation.
app.use("/api/moderation", moderationRoutes);

// Handle unknown routes.
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "The requested resource was not found.",
  });
});

// Centralised error handling.
app.use(errorHandler);

export default app;

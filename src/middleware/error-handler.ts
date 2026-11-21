import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

import mongoose from "mongoose";
import multer from "multer";
import { ZodError } from "zod";

import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";

const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = "An unexpected error occurred.";
  let details: unknown;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 422;
    message = "Validation failed.";

    details = error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  } else if (error instanceof multer.MulterError) {
    statusCode =
      error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    message =
      error.code === "LIMIT_FILE_SIZE"
        ? "The uploaded file exceeds the maximum allowed size."
        : "The uploaded file could not be processed. Please check your upload.";
  } else if (
    error instanceof mongoose.Error.ValidationError
  ) {
    statusCode = 422;
    message = "Database validation failed.";

    details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  } else if (
    error instanceof mongoose.Error.CastError
  ) {
    statusCode = 400;
    message = "Invalid resource identifier.";
  } else if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  ) {
    statusCode = 409;
    message = "A record with this information already exists.";
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  const response: {
    success: false;
    message: string;
    details?: unknown;
    stack?: string;
  } = {
    success: false,
    message,
  };

  if (details !== undefined) {
    response.details = details;
  }

  if (
    env.NODE_ENV === "development" &&
    error instanceof Error &&
    error.stack
  ) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;

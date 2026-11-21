import { Router } from "express";
import type { RequestHandler } from "express";

import {
  publicSubmissionSchema,
} from "../schemas/submission.schema.js";

import {
  uploadSubmissionMedia as uploadFile,
  validateSubmissionFileSize,
} from "../middleware/upload-submission.js";

import validate from "../middleware/validate.js";

import {
  submissionRateLimiter,
} from "../middleware/rate-limiter.js";

import {
  createSubmission,
} from "../controllers/submission.controller.js";

const router = Router();

const validateUploadedFile: RequestHandler = (
  req,
  _res,
  next,
) => {
  try {
    if (req.file) {
      validateSubmissionFileSize(req.file);
    }

    next();
  } catch (error) {
    next(error);
  }
};

router.post(
  "/",
  submissionRateLimiter,
  uploadFile,
  validate(publicSubmissionSchema),
  validateUploadedFile,
  createSubmission,
);

export default router;
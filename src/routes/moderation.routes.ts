import { Router } from "express";

import authenticate from "../middleware/authenticate.js";
import csrfProtection from "../middleware/csrf-protection.js";

import {
  listSubmissions,
  getSubmission,
  approveSubmissionHandler,
  rejectSubmissionHandler,
  hideSubmissionHandler,
  restoreSubmissionHandler,
  updateSubmissionFeatured,
  removeSubmission,
} from "../controllers/moderation.controller.js";

const router = Router();

// All moderation routes require an authenticated administrator.
router.use(authenticate);

// Retrieve submissions.
router.get("/", listSubmissions);
router.get("/:submissionId", getSubmission);

// Moderation actions.
router.patch(
  "/:submissionId/approve",
  csrfProtection,
  approveSubmissionHandler,
);

router.patch(
  "/:submissionId/reject",
  csrfProtection,
  rejectSubmissionHandler,
);

router.patch(
  "/:submissionId/hide",
  csrfProtection,
  hideSubmissionHandler,
);

router.patch(
  "/:submissionId/restore",
  csrfProtection,
  restoreSubmissionHandler,
);

// Featured submission management.
router.patch(
  "/:submissionId/featured",
  csrfProtection,
  updateSubmissionFeatured,
);

// Permanent deletion.
router.delete(
  "/:submissionId",
  csrfProtection,
  removeSubmission,
);

export default router;

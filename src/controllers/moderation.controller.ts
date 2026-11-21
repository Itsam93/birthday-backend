import type { Request, Response } from "express";
import { z } from "zod";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  SUBMISSION_STATUSES,
  SUBMISSION_TYPES,
} from "../models/Submission.js";

import {
  getSubmissions,
  getSubmissionById,
  approveSubmission,
  rejectSubmission,
  hideSubmission,
  restoreSubmission,
  setSubmissionFeatured,
  deleteSubmission,
} from "../services/moderation.service.js";

const submissionFiltersSchema = z.object({
  status: z.enum(SUBMISSION_STATUSES).optional(),
  type: z.enum(SUBMISSION_TYPES).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const moderationNoteSchema = z.object({
  note: z
    .string()
    .trim()
    .max(1000, "Moderation notes cannot exceed 1000 characters.")
    .optional(),
});

const featuredSchema = z.object({
  isFeatured: z.boolean(),
});

function getAdminId(req: Request): string {
  if (!req.adminId) {
    throw new ApiError(
      401,
      "Administrator authentication is required.",
    );
  }

  return req.adminId;
}

function getSubmissionId(req: Request): string {
  const submissionId = req.params.submissionId;

  if (
    typeof submissionId !== "string" ||
    !submissionId.trim()
  ) {
    throw new ApiError(
      400,
      "A valid submission identifier is required.",
    );
  }

  return submissionId;
}

function getModerationNote(
  body: unknown,
): string | undefined {
  return moderationNoteSchema.parse(body).note;
}

function getModerationOptions(req: Request) {
  const note = getModerationNote(req.body);

  return {
    adminId: getAdminId(req),
    ...(note !== undefined ? { note } : {}),
  };
}

export const listSubmissions = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = submissionFiltersSchema.parse(req.query);

    const result = await getSubmissions({
      ...(filters.status !== undefined
        ? { status: filters.status }
        : {}),
      ...(filters.type !== undefined
        ? { type: filters.type }
        : {}),
      ...(filters.page !== undefined
        ? { page: filters.page }
        : {}),
      ...(filters.limit !== undefined
        ? { limit: filters.limit }
        : {}),
    });

    res.status(200).json({
      success: true,
      message: "Submissions retrieved successfully.",
      data: result,
    });
  },
);

export const getSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    const submission = await getSubmissionById(
      getSubmissionId(req),
    );

    res.status(200).json({
      success: true,
      message: "Submission retrieved successfully.",
      data: { submission },
    });
  },
);

export const approveSubmissionHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const submission = await approveSubmission(
      getSubmissionId(req),
      getModerationOptions(req),
    );

    res.status(200).json({
      success: true,
      message: "Submission approved successfully.",
      data: { submission },
    });
  },
);

export const rejectSubmissionHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const submission = await rejectSubmission(
      getSubmissionId(req),
      getModerationOptions(req),
    );

    res.status(200).json({
      success: true,
      message: "Submission rejected successfully.",
      data: { submission },
    });
  },
);

export const hideSubmissionHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const submission = await hideSubmission(
      getSubmissionId(req),
      getModerationOptions(req),
    );

    res.status(200).json({
      success: true,
      message: "Submission hidden successfully.",
      data: { submission },
    });
  },
);

export const restoreSubmissionHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const submission = await restoreSubmission(
      getSubmissionId(req),
      getModerationOptions(req),
    );

    res.status(200).json({
      success: true,
      message: "Submission restored successfully.",
      data: { submission },
    });
  },
);

export const updateSubmissionFeatured = asyncHandler(
  async (req: Request, res: Response) => {
    const { isFeatured } = featuredSchema.parse(req.body);

    const submission = await setSubmissionFeatured(
      getSubmissionId(req),
      isFeatured,
    );

    res.status(200).json({
      success: true,
      message: isFeatured
        ? "Submission featured successfully."
        : "Submission removed from featured submissions.",
      data: { submission },
    });
  },
);

export const removeSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteSubmission(getSubmissionId(req));

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully.",
    });
  },
);

import mongoose from "mongoose";

import Submission, {
  type ISubmission,
  type SubmissionStatus,
  type SubmissionType,
} from "../models/Submission.js";

import {
  deleteSubmissionMedia,
} from "./cloudinary.service.js";

import ApiError from "../utils/ApiError.js";

interface SubmissionFilters {
  status?: SubmissionStatus;
  type?: SubmissionType;
  page?: number;
  limit?: number;
}

interface ModerationOptions {
  adminId: string;
  note?: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function validateAdminId(adminId: string): void {
  if (!mongoose.isValidObjectId(adminId)) {
    throw new ApiError(401, "Invalid administrator session.");
  }
}

async function findSubmission(
  submissionId: string,
): Promise<ISubmission> {
  if (!mongoose.isValidObjectId(submissionId)) {
    throw new ApiError(400, "Invalid submission identifier.");
  }

  const submission = await Submission.findById(submissionId);

  if (!submission) {
    throw new ApiError(404, "Submission not found.");
  }

  return submission;
}

export async function getSubmissions(
  filters: SubmissionFilters = {},
) {
  const page = Math.max(
    1,
    Math.floor(filters.page ?? DEFAULT_PAGE),
  );

  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(filters.limit ?? DEFAULT_LIMIT)),
  );

  const query = {
    ...(filters.status !== undefined
      ? { status: filters.status }
      : {}),
    ...(filters.type !== undefined
      ? { type: filters.type }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [submissions, total] = await Promise.all([
    Submission.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Submission.countDocuments(query),
  ]);

  return {
    submissions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getSubmissionById(
  submissionId: string,
): Promise<ISubmission> {
  return findSubmission(submissionId);
}

export async function approveSubmission(
  submissionId: string,
  options: ModerationOptions,
): Promise<ISubmission> {
  validateAdminId(options.adminId);

  const submission = await findSubmission(submissionId);

  if (submission.status === "HIDDEN") {
    throw new ApiError(
      409,
      "Restore this submission before approving it.",
    );
  }

  submission.status = "APPROVED";
  submission.statusBeforeHide = null;
  submission.moderatedAt = new Date();
  submission.moderatedBy = new mongoose.Types.ObjectId(
    options.adminId,
  );
  submission.moderationNote = options.note?.trim() || null;

  await submission.save();

  return submission;
}

export async function rejectSubmission(
  submissionId: string,
  options: ModerationOptions,
): Promise<ISubmission> {
  validateAdminId(options.adminId);

  const submission = await findSubmission(submissionId);

  if (submission.status === "HIDDEN") {
    throw new ApiError(
      409,
      "Restore this submission before rejecting it.",
    );
  }

  submission.status = "REJECTED";
  submission.statusBeforeHide = null;
  submission.isFeatured = false;
  submission.moderatedAt = new Date();
  submission.moderatedBy = new mongoose.Types.ObjectId(
    options.adminId,
  );
  submission.moderationNote = options.note?.trim() || null;

  await submission.save();

  return submission;
}

export async function hideSubmission(
  submissionId: string,
  options: ModerationOptions,
): Promise<ISubmission> {
  validateAdminId(options.adminId);

  const submission = await findSubmission(submissionId);

  if (submission.status === "HIDDEN") {
    throw new ApiError(
      409,
      "This submission is already hidden.",
    );
  }

  if (submission.status !== "APPROVED") {
    throw new ApiError(
      409,
      "Only approved submissions can be hidden.",
    );
  }

  submission.statusBeforeHide = submission.status;
  submission.status = "HIDDEN";
  submission.isFeatured = false;
  submission.moderatedAt = new Date();
  submission.moderatedBy = new mongoose.Types.ObjectId(
    options.adminId,
  );
  submission.moderationNote = options.note?.trim() || null;

  await submission.save();

  return submission;
}

export async function restoreSubmission(
  submissionId: string,
  options: ModerationOptions,
): Promise<ISubmission> {
  validateAdminId(options.adminId);

  const submission = await findSubmission(submissionId);

  if (submission.status !== "HIDDEN") {
    throw new ApiError(
      409,
      "Only hidden submissions can be restored.",
    );
  }

  submission.status =
    submission.statusBeforeHide ?? "APPROVED";

  submission.statusBeforeHide = null;
  submission.moderatedAt = new Date();
  submission.moderatedBy = new mongoose.Types.ObjectId(
    options.adminId,
  );
  submission.moderationNote = options.note?.trim() || null;

  await submission.save();

  return submission;
}

export async function setSubmissionFeatured(
  submissionId: string,
  isFeatured: boolean,
): Promise<ISubmission> {
  const submission = await findSubmission(submissionId);

  if (isFeatured && submission.status !== "APPROVED") {
    throw new ApiError(
      409,
      "Only approved submissions can be featured.",
    );
  }

  submission.isFeatured = isFeatured;

  await submission.save();

  return submission;
}

export async function deleteSubmission(
  submissionId: string,
): Promise<void> {
  const submission = await findSubmission(submissionId);

  await Submission.deleteOne({
    _id: submission._id,
  });

  if (submission.media) {
    try {
      await deleteSubmissionMedia(
        submission.media.publicId,
        submission.media.resourceType,
      );
    } catch (error) {
      console.error(
        `Submission ${submissionId} was deleted, but its Cloudinary media could not be removed:`,
        error,
      );
    }
  }
}

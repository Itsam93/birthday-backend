import type { Request, Response } from "express";

import {
  createPublicSubmission,
} from "../services/submission.service.js";

import {
  publicSubmissionSchema,
} from "../schemas/submission.schema.js";

import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.body || typeof req.body !== "object") {
      throw new ApiError(
        422,
        "Please provide valid submission details.",
      );
    }

    const input = publicSubmissionSchema.parse(req.body);

    const submission = await createPublicSubmission(
      input,
      req.file,
    );

    res.status(201).json(
      new ApiResponse({
        message:
          "Your submission has been received and is awaiting review.",
        data: {
          submission: {
            id: submission._id.toString(),
            type: submission.type,
            memberFullName: submission.memberFullName,
            churchName: submission.churchName,
            groupName: submission.groupName,
            status: submission.status,
            createdAt: submission.createdAt,
          },
        },
      }),
    );
  },
);

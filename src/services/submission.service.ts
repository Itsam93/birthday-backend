import Submission, {
  type SubmissionType,
  type ISubmission,
} from "../models/Submission.js";

import type {
  PublicSubmissionInput,
} from "../schemas/submission.schema.js";

import {
  uploadSubmissionMedia as uploadToCloudinary,
  deleteSubmissionMedia,
  type CloudinaryResourceType,
  type CloudinaryUploadResult,
} from "./cloudinary.service.js";

import {
  validateSubmissionFileSize,
} from "../middleware/upload-submission.js";

import ApiError from "../utils/ApiError.js";

type UploadedFile = Express.Multer.File | undefined;

function getExpectedResourceType(
  type: SubmissionType,
): CloudinaryResourceType | null {
  if (type === "MESSAGE") {
    return null;
  }

  return type === "PHOTO" ? "image" : "video";
}

export async function createPublicSubmission(
  input: PublicSubmissionInput,
  file?: UploadedFile,
): Promise<ISubmission> {
  const expectedResourceType = getExpectedResourceType(
    input.type,
  );

  if (input.type === "MESSAGE" && file) {
    throw new ApiError(
      400,
      "Written messages cannot contain media.",
    );
  }

  if (expectedResourceType && !file) {
    throw new ApiError(
      400,
      "Please select a media file for this submission.",
    );
  }

  let uploadedMedia: CloudinaryUploadResult | null = null;

  if (file && expectedResourceType) {
    validateSubmissionFileSize(file);

    if (
      !file.mimetype.startsWith(`${expectedResourceType}/`)
    ) {
      throw new ApiError(
        400,
        input.type === "PHOTO"
          ? "Please upload an image for your photo submission."
          : "Please upload a video for your video submission.",
      );
    }

    uploadedMedia = await uploadToCloudinary(
      file.buffer,
      expectedResourceType,
    );
  }

  try {
    const submission = await Submission.create({
      type: input.type,
      memberFullName: input.memberFullName,
      churchName: input.churchName,
      groupName: input.groupName,
      message:
        input.type === "MESSAGE"
          ? input.message.trim()
          : null,
      media: uploadedMedia
        ? {
            url: uploadedMedia.url,
            publicId: uploadedMedia.publicId,
            resourceType: uploadedMedia.resourceType,
            format: uploadedMedia.format,
            bytes: uploadedMedia.bytes,
          }
        : null,
      status: "PENDING",
    });

    return submission;
  } catch (error) {
    if (uploadedMedia) {
      try {
        await deleteSubmissionMedia(
          uploadedMedia.publicId,
          uploadedMedia.resourceType,
        );
      } catch (cleanupError) {
        console.error(
          "Failed to clean up Cloudinary media after submission creation failed:",
          cleanupError,
        );
      }
    }

    throw error;
  }
}

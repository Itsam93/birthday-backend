import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

import {
  ensureCloudinaryConfigured,
} from "../config/cloudinary.js";

import ApiError from "../utils/ApiError.js";

export type CloudinaryResourceType = "image" | "video";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  resourceType: CloudinaryResourceType;
  format: string;
  bytes: number;
}

const SUBMISSION_FOLDER = "birthday-celebration/submissions";

export async function uploadSubmissionMedia(
  fileBuffer: Buffer,
  resourceType: CloudinaryResourceType,
): Promise<CloudinaryUploadResult> {
  ensureCloudinaryConfigured();

  if (!fileBuffer.length) {
    throw new ApiError(400, "The uploaded file is empty.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: SUBMISSION_FOLDER,
        resource_type: resourceType,
        allowed_formats:
          resourceType === "image"
            ? ["jpg", "jpeg", "png", "webp"]
            : ["mp4", "webm", "mov"],
        unique_filename: true,
        overwrite: false,
      },
      (
        error: Error | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) {
          reject(
            new ApiError(
              502,
              "Unable to upload your media. Please try again.",
            ),
          );
          return;
        }

        if (!result) {
          reject(
            new ApiError(
              502,
              "Cloudinary did not return an upload result.",
            ),
          );
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType,
          format: result.format,
          bytes: result.bytes,
        });
      },
    );

    uploadStream.end(fileBuffer);
  });
}

export async function deleteSubmissionMedia(
  publicId: string,
  resourceType: CloudinaryResourceType,
): Promise<void> {
  ensureCloudinaryConfigured();

  try {
    const result = await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: resourceType,
        invalidate: true,
      },
    );

    if (
      result.result !== "ok" &&
      result.result !== "not found"
    ) {
      throw new Error(
        `Cloudinary deletion failed: ${result.result}`,
      );
    }
  } catch {
    throw new ApiError(
      502,
      "Unable to remove the uploaded media from storage.",
    );
  }
}

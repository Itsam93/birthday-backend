import multer from "multer";

import ApiError from "../utils/ApiError.js";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_VIDEO_SIZE,
    files: 1,
    fields: 10,
    fieldSize: 16 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new ApiError(
          415,
          "Unsupported file format. Upload a JPG, PNG, WebP, MP4, WebM or MOV file.",
        ),
      );

      return;
    }

    callback(null, true);
  },
});

export const uploadSubmissionMedia = upload.single("media");

export function validateSubmissionFileSize(
  file: Express.Multer.File,
): void {
  if (
    file.mimetype.startsWith("image/") &&
    file.size > MAX_IMAGE_SIZE
  ) {
    throw new ApiError(
      413,
      "Images cannot exceed 10 MB.",
    );
  }

  if (
    file.mimetype.startsWith("video/") &&
    file.size > MAX_VIDEO_SIZE
  ) {
    throw new ApiError(
      413,
      "Videos cannot exceed 100 MB.",
    );
  }
}

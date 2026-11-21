import { v2 as cloudinary } from "cloudinary";

import { env, isCloudinaryConfigured } from "./env.js";

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME!,
    api_key: env.CLOUDINARY_API_KEY!,
    api_secret: env.CLOUDINARY_API_SECRET!,
    secure: true,
  });
}

export { cloudinary };

export function ensureCloudinaryConfigured(): void {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary is not configured. Please provide all required Cloudinary credentials.",
    );
  }
}

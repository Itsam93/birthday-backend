import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    PORT: z.coerce.number().int().positive().default(5000),

    FRONTEND_URL: z.string().url(),

    MONGODB_URI: z.string().min(1, "MongoDB URI is required."),

    JWT_SECRET: z
      .string()
      .min(32, "JWT secret must contain at least 32 characters."),

    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    ADMIN_EMAIL: z.string().email(),
    ADMIN_PASSWORD: z.string().min(12),
  })
  .superRefine((data, ctx) => {
    const cloudinaryValues = [
      data.CLOUDINARY_CLOUD_NAME,
      data.CLOUDINARY_API_KEY,
      data.CLOUDINARY_API_SECRET,
    ];

    const configuredCount = cloudinaryValues.filter(Boolean).length;

    if (configuredCount > 0 && configuredCount < 3) {
      ctx.addIssue({
        code: "custom",
        message: "All three Cloudinary credentials must be provided together.",
        path: ["CLOUDINARY_CLOUD_NAME"],
      });
    }
  });

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment configuration:");
  console.error(z.treeifyError(result.error));
  process.exit(1);
}

export const env = result.data;

export const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET,
);

import { z } from "zod";

import { SUBMISSION_TYPES } from "../models/Submission.js";

export const publicSubmissionSchema = z
  .object({
    type: z.enum(SUBMISSION_TYPES),

    memberFullName: z
      .string()
      .trim()
      .min(2, "Please enter your full name.")
      .max(150, "Your full name cannot exceed 150 characters."),

    churchName: z
      .string()
      .trim()
      .min(2, "Please enter your church name.")
      .max(150, "Church name cannot exceed 150 characters."),

    groupName: z
      .string()
      .trim()
      .min(2, "Please enter your group name.")
      .max(150, "Group name cannot exceed 150 characters."),

    message: z
      .string()
      .trim()
      .max(3000, "Your message cannot exceed 3000 characters.")
      .optional()
      .default(""),
  })
  .superRefine((data, ctx) => {
    if (data.type === "MESSAGE" && !data.message.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: "Please enter your birthday message.",
      });
    }
  });

export type PublicSubmissionInput =
  z.infer<typeof publicSubmissionSchema>;

import mongoose, {
  Schema,
  type Document,
} from "mongoose";

export const SUBMISSION_TYPES = [
  "MESSAGE",
  "PHOTO",
  "VIDEO",
  "VIDEO_TRIBUTE",
] as const;

export type SubmissionType =
  (typeof SUBMISSION_TYPES)[number];

export const SUBMISSION_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "HIDDEN",
] as const;

export type SubmissionStatus =
  (typeof SUBMISSION_STATUSES)[number];

export interface ISubmissionMedia {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
  format: string;
  bytes: number;
}

export interface ISubmission extends Document {
  type: SubmissionType;
  memberFullName: string;
  churchName: string;
  groupName: string;
  message: string | null;
  media: ISubmissionMedia | null;
  status: SubmissionStatus;
  statusBeforeHide: SubmissionStatus | null;
  isFeatured: boolean;
  moderatedAt: Date | null;
  moderatedBy: mongoose.Types.ObjectId | null;
  moderationNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<ISubmissionMedia>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    resourceType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    format: {
      type: String,
      required: true,
      trim: true,
    },
    bytes: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const submissionSchema = new Schema<ISubmission>(
  {
    type: {
      type: String,
      enum: SUBMISSION_TYPES,
      required: true,
      index: true,
    },
    memberFullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },
    churchName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    groupName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: null,
    },
    media: {
      type: mediaSchema,
      default: null,
    },
    status: {
      type: String,
      enum: SUBMISSION_STATUSES,
      default: "PENDING",
      index: true,
    },
    statusBeforeHide: {
      type: String,
      enum: SUBMISSION_STATUSES,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    moderatedAt: {
      type: Date,
      default: null,
    },
    moderatedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    moderationNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

submissionSchema.pre("validate", function () {
  if (this.type === "MESSAGE") {
    if (!this.message?.trim()) {
      this.invalidate(
        "message",
        "A written message is required.",
      );
    }

    if (this.media) {
      this.invalidate(
        "media",
        "Written messages cannot contain media.",
      );
    }

    return;
  }

  if (!this.media) {
    this.invalidate(
      "media",
      "A media file is required for this submission type.",
    );

    return;
  }

  const expectedResourceType =
    this.type === "PHOTO" ? "image" : "video";

  if (this.media.resourceType !== expectedResourceType) {
    this.invalidate(
      "media",
      `This submission type requires ${expectedResourceType} media.`,
    );
  }
});

submissionSchema.index({ status: 1, createdAt: -1 });
submissionSchema.index({ type: 1, status: 1, createdAt: -1 });
submissionSchema.index({ isFeatured: 1, status: 1, createdAt: -1 });

const Submission = mongoose.model<ISubmission>(
  "Submission",
  submissionSchema,
);

export default Submission;

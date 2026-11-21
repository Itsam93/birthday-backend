import Submission from "../models/Submission.js";

interface PublicContentFilters {
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

type PublicSubmissionType =
  | "MESSAGE"
  | "PHOTO"
  | "VIDEO"
  | "VIDEO_TRIBUTE";

type PublicContentType =
  | PublicSubmissionType
  | ("PHOTO" | "VIDEO")[];

function getPagination(filters: PublicContentFilters = {}) {
  const page = Math.max(
    1,
    Math.floor(filters.page ?? DEFAULT_PAGE),
  );

  const limit = Math.min(
    MAX_LIMIT,
    Math.max(
      1,
      Math.floor(filters.limit ?? DEFAULT_LIMIT),
    ),
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

async function getApprovedSubmissions(
  type: PublicContentType,
  filters: PublicContentFilters = {},
) {
  const { page, limit, skip } = getPagination(filters);

  const query = {
    status: "APPROVED" as const,
    ...(Array.isArray(type)
      ? { type: { $in: type } }
      : { type }),
  };

  const [submissions, total] = await Promise.all([
    Submission.find(query)
      .select(
        [
          "type",
          "memberFullName",
          "churchName",
          "groupName",
          "message",
          "media.url",
          "media.resourceType",
          "media.format",
          "media.bytes",
          "createdAt",
        ].join(" "),
      )
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

export async function getPublicMessages(
  filters: PublicContentFilters = {},
) {
  return getApprovedSubmissions("MESSAGE", filters);
}

export async function getPublicGallery(
  filters: PublicContentFilters = {},
) {
  return getApprovedSubmissions(
    ["PHOTO", "VIDEO"],
    filters,
  );
}

export async function getPublicVideoTributes(
  filters: PublicContentFilters = {},
) {
  return getApprovedSubmissions(
    "VIDEO_TRIBUTE",
    filters,
  );
}

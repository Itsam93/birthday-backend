import type { Request, Response } from "express";
import { z } from "zod";

import asyncHandler from "../utils/asyncHandler.js";

import {
  getPublicMessages,
  getPublicGallery,
  getPublicVideoTributes,
} from "../services/public-content.service.js";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

function getPaginationFilters(query: Request["query"]) {
  const filters = paginationSchema.parse(query);

  return {
    ...(filters.page !== undefined
      ? { page: filters.page }
      : {}),
    ...(filters.limit !== undefined
      ? { limit: filters.limit }
      : {}),
  };
}

export const getMessages = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getPublicMessages(
      getPaginationFilters(req.query),
    );

    res.status(200).json({
      success: true,
      message: "Birthday messages retrieved successfully.",
      data: result,
    });
  },
);

export const getGallery = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getPublicGallery(
      getPaginationFilters(req.query),
    );

    res.status(200).json({
      success: true,
      message: "Gallery items retrieved successfully.",
      data: result,
    });
  },
);

export const getVideoTributes = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getPublicVideoTributes(
      getPaginationFilters(req.query),
    );

    res.status(200).json({
      success: true,
      message: "Video tributes retrieved successfully.",
      data: result,
    });
  },
);

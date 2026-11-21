import type { Request, Response } from "express";

import {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  authCookieOptions,
  csrfCookieOptions,
  clearCookieOptions,
} from "../config/auth.js";

import {
  loginAdmin,
  getAuthenticatedAdmin,
} from "../services/auth.service.js";

import {
  generateAuthToken,
  generateCsrfToken,
} from "../utils/token.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const login = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const admin = await loginAdmin({
      email,
      password,
    });

    const authToken = generateAuthToken(admin.id);
    const csrfToken = generateCsrfToken();

    res.cookie(
      AUTH_COOKIE_NAME,
      authToken,
      authCookieOptions,
    );

    res.cookie(
      CSRF_COOKIE_NAME,
      csrfToken,
      csrfCookieOptions,
    );

    res.status(200).json(
      new ApiResponse({
        message: "Login successful.",
        data: {
          admin,
          csrfToken,
        },
      }),
    );
  },
);

export const getCurrentAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.adminId) {
      throw new ApiError(401, "Authentication required.");
    }

    const admin = await getAuthenticatedAdmin(req.adminId);
    const csrfToken = req.cookies?.[CSRF_COOKIE_NAME] ?? null;

    res.status(200).json(
      new ApiResponse({
        message: "Administrator retrieved successfully.",
        data: {
          admin,
          csrfToken,
        },
      }),
    );
  },
);

export const logout = asyncHandler(
  async (_req: Request, res: Response) => {
    res.clearCookie(
      AUTH_COOKIE_NAME,
      clearCookieOptions,
    );

    res.clearCookie(
      CSRF_COOKIE_NAME,
      clearCookieOptions,
    );

    res.status(200).json(
      new ApiResponse({
        message: "Logout successful.",
      }),
    );
  },
);

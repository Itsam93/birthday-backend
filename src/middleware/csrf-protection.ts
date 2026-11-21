import {
  timingSafeEqual,
} from "node:crypto";

import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  CSRF_COOKIE_NAME,
} from "../config/auth.js";

import ApiError from "../utils/ApiError.js";

export default function csrfProtection(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  const headerToken = req.headers["x-csrf-token"];

  if (
    !cookieToken ||
    typeof headerToken !== "string"
  ) {
    next(new ApiError(403, "CSRF validation failed."));
    return;
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (
    cookieBuffer.length !== headerBuffer.length ||
    !timingSafeEqual(cookieBuffer, headerBuffer)
  ) {
    next(new ApiError(403, "CSRF validation failed."));
    return;
  }

  next();
}
import type {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/env.js";
import { AUTH_COOKIE_NAME } from "../config/auth.js";
import ApiError from "../utils/ApiError.js";

export default function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    next(new ApiError(401, "Authentication required."));
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET,
    ) as JwtPayload;

    if (typeof decoded.sub !== "string") {
      throw new ApiError(401, "Invalid authentication token.");
    }

    req.adminId = decoded.sub;

    next();
  } catch {
    next(new ApiError(401, "Your session is invalid or has expired."));
  }
}
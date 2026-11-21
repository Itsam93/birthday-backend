import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export function generateAuthToken(adminId: string): string {
  return jwt.sign(
    {
      sub: adminId,
    },
    env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
}

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}
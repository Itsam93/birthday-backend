import type { CookieOptions } from "express";

import { env } from "./env.js";

export const AUTH_COOKIE_NAME = "birthday_admin_session";
export const CSRF_COOKIE_NAME = "birthday_admin_csrf";

const isProduction = env.NODE_ENV === "production";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

export const csrfCookieOptions: CookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000,
};

export const clearCookieOptions: CookieOptions = {
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};
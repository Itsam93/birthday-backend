import { Router } from "express";
import { z } from "zod";

import {
  login,
  logout,
  getCurrentAdmin,
} from "../controllers/auth.controller.js";

import authenticate from "../middleware/authenticate.js";
import csrfProtection from "../middleware/csrf-protection.js";
import validate from "../middleware/validate.js";
import { authRateLimiter } from "../middleware/rate-limiter.js";

const router = Router();

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("A valid email address is required.")
    .max(254),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(128),
});

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  login,
);

router.get(
  "/me",
  authenticate,
  getCurrentAdmin,
);

router.post(
  "/logout",
  authenticate,
  csrfProtection,
  logout,
);

export default router;
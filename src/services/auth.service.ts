import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";
import ApiError from "../utils/ApiError.js";

interface LoginCredentials {
  email: string;
  password: string;
}

export async function loginAdmin(credentials: LoginCredentials) {
  const email = credentials.email.trim().toLowerCase();

  const admin = await Admin.findOne({ email }).select("+passwordHash");

  if (!admin) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!admin.isActive) {
    throw new ApiError(403, "This administrator account is inactive.");
  }

  const passwordMatches = await bcrypt.compare(
    credentials.password,
    admin.passwordHash,
  );

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password.");
  }

  admin.lastLoginAt = new Date();

  await admin.save();

  return {
    id: admin.id,
    email: admin.email,
    lastLoginAt: admin.lastLoginAt,
  };
}

export async function getAuthenticatedAdmin(adminId: string) {
  const admin = await Admin.findById(adminId);

  if (!admin || !admin.isActive) {
    throw new ApiError(401, "Authentication is no longer valid.");
  }

  return {
    id: admin.id,
    email: admin.email,
    lastLoginAt: admin.lastLoginAt,
  };
}
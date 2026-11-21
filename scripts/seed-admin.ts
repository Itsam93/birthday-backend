import bcrypt from "bcryptjs";

import { env } from "../src/config/env.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "../src/config/database.js";
import Admin from "../src/models/Admin.js";

async function seedAdmin(): Promise<void> {
  let connected = false;

  try {
    await connectDatabase();
    connected = true;

    const existingAdmin = await Admin.findOne();

    if (existingAdmin) {
      throw new Error(
        "An administrator already exists. No additional account was created.",
      );
    }

    const passwordHash = await bcrypt.hash(
      env.ADMIN_PASSWORD,
      12,
    );

    await Admin.create({
      email: env.ADMIN_EMAIL,
      passwordHash,
      isActive: true,
    });

    console.log("Initial administrator created successfully.");
    console.log(`Administrator email: ${env.ADMIN_EMAIL}`);
  } finally {
    if (connected) {
      await disconnectDatabase();
    }
  }
}

seedAdmin().catch((error: unknown) => {
  console.error("Administrator seeding failed:", error);
  process.exit(1);
});

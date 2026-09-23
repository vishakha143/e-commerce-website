/**
 * Sets the admin account's password from ADMIN_NEW_PASSWORD in .env.local
 * (gitignored) so the secret never lands in chat, shell history, or git.
 * Run with: npm run rotate-admin
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../src/models/User";

async function main() {
  const uri = process.env.MONGODB_URI;
  const newPassword = process.env.ADMIN_NEW_PASSWORD;
  const email = process.env.ADMIN_SEED_EMAIL || "admin@fashion.test";

  if (!uri) throw new Error("MONGODB_URI is not set (checked .env.local)");
  if (!newPassword) throw new Error("ADMIN_NEW_PASSWORD is not set in .env.local");
  if (newPassword.length < 12) {
    throw new Error("ADMIN_NEW_PASSWORD must be at least 12 characters");
  }

  await mongoose.connect(uri);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const result = await User.updateOne({ email, role: "admin" }, { password: passwordHash });

  if (result.matchedCount === 0) {
    throw new Error(`No admin user found with email ${email}`);
  }

  console.log(`Password updated for ${email}. Remove ADMIN_NEW_PASSWORD from .env.local now.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

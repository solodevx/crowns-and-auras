import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Admin } from "../src/models/Admin";

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!uri) fail("MONGODB_URI is missing in .env.local");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) fail("Enter a valid email");
  if (!password || password.length < 10) {
    fail("The password must be at least 10 characters");
  }

  // 12 = how slow the scrambling is. Higher is safer and slower.
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    // Upsert: creates the admin, or resets the password if this email exists
    await Admin.updateOne(
      { email },
      { $set: { email, passwordHash } },
      { upsert: true },
    );
    console.log(`Admin saved for ${email}`);
  } catch (error) {
    console.error("Failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();

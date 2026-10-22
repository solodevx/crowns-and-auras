"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSession } from "@/lib/session";
import { Admin } from "@/models/Admin";

const loginSchema = z.object({
  email: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(200),
});

const GENERIC_ERROR = "Incorrect email or password.";

// A fake scramble to compare against when the email doesn't exist, so an
// unknown email takes as long to reject as a wrong password does.
const dummyHashPromise = bcrypt.hash("not-a-real-password", 12);

export type LoginResult = { ok: true } | { ok: false; message: string };

export async function loginAction(payload: unknown): Promise<LoginResult> {
  // 8 attempts per 15 minutes per visitor. Checked first, before any real work.
  const rate = await checkRateLimit("admin-login", 8, 15 * 60);
  if (!rate.allowed) {
    return {
      ok: false,
      message: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, message: GENERIC_ERROR };

  const email = parsed.data.email.toLowerCase();
  const { password } = parsed.data;

  try {
    await connectToDatabase();
    const admin = await Admin.findOne({ email });
    const hashToCheck = admin ? admin.passwordHash : await dummyHashPromise;
    const passwordMatches = await bcrypt.compare(password, hashToCheck);

    if (!admin || !passwordMatches)
      return { ok: false, message: GENERIC_ERROR };

    await createSession(admin._id.toString());
  } catch (error) {
    console.error("login failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  // The form moves the page. No redirect here.
  return { ok: true };
}
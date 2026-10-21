import "server-only";
import { headers } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { RateLimit } from "@/models/RateLimit";

let indexesReady: Promise<unknown> | null = null;

// The visitor's address as set by the hosting platform. When running locally
// there is none, so everyone shares one bucket called "unknown".
async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown"
  );
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

// Allows `limit` requests per visitor per time window.
export async function checkRateLimit(
  name: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean }> {
  try {
    const ip = await getClientIp();
    const windowMs = windowSeconds * 1000;
    const bucket = Math.floor(Date.now() / windowMs);
    const key = `${name}:${ip}:${bucket}`;
    const expiresAt = new Date((bucket + 1) * windowMs + 60_000);

    await connectToDatabase();
    indexesReady ??= RateLimit.createIndexes();
    await indexesReady;

    const bump = () =>
      RateLimit.findOneAndUpdate(
        { key },
        { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
        { upsert: true, new: true, setDefaultsOnInsert: false },
      );

    let record;
    try {
      record = await bump();
    } catch (error) {
      // Two first requests at the same instant can collide: just try again
      if (!isDuplicateKeyError(error)) throw error;
      record = await bump();
    }

    return { allowed: (record?.count ?? 1) <= limit };
  } catch (error) {
    console.error("rate limit check failed:", error);
    return { allowed: true }; // fail open
  }
}
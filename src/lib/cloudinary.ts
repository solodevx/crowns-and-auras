import "server-only";
import { createHash } from "node:crypto";

export const UPLOAD_FOLDER = "crowns-and-auras/products";

function getConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary keys are missing in .env.local");
  }
  return { cloudName, apiKey, apiSecret };
}

// A one-time pass for ONE upload. The signed values are listed alphabetically,
// the secret goes on the end, and the whole thing is scrambled.
export function signUpload() {
  const { cloudName, apiKey, apiSecret } = getConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `folder=${UPLOAD_FOLDER}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");
  return { cloudName, apiKey, timestamp, folder: UPLOAD_FOLDER, signature };
}

// Only accept photos that really live in OUR Cloudinary account.
export function isOwnImageUrl(url: string): boolean {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return false;
  return url.startsWith(
    `https://res.cloudinary.com/${cloudName}/image/upload/`,
  );
}
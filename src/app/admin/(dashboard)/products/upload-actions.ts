"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { signUpload } from "@/lib/cloudinary";

export type UploadSignatureResult =
  | {
      ok: true;
      cloudName: string;
      apiKey: string;
      timestamp: number;
      folder: string;
      signature: string;
    }
  | { ok: false; message: string };

export async function getUploadSignatureAction(): Promise<UploadSignatureResult> {
  await requireAdmin(); // the lock: always first

  try {
    return { ok: true, ...signUpload() };
  } catch (error) {
    console.error("upload signature failed:", error);
    return { ok: false, message: "Photo uploads are not set up yet." };
  }
}
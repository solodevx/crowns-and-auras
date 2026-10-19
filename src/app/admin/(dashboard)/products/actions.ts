"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";

export type ProductActionResult = { ok: true } | { ok: false; message: string };

const visibilitySchema = z.object({
  productId: z.string().refine((value) => mongoose.isValidObjectId(value)),
  isActive: z.boolean(),
});

export async function setProductVisibilityAction(
  payload: unknown,
): Promise<ProductActionResult> {
  await requireAdmin(); // the lock: always first

  const parsed = visibilitySchema.safeParse(payload);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  try {
    await connectToDatabase();
    const result = await Product.updateOne(
      { _id: parsed.data.productId },
      { $set: { isActive: parsed.data.isActive } },
    );

    if (result.matchedCount === 0) {
      return { ok: false, message: "Product not found." };
    }
  } catch (error) {
    console.error("product visibility update failed:", error);
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
    };
  }

 
  revalidatePath("/admin", "layout");
  return { ok: true };
}
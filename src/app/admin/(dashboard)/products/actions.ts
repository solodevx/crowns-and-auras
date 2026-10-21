"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { parseProductInput } from "@/lib/parse-product-input";
import type { ProductFormResult } from "@/lib/product-validators";
import { Product } from "@/models/Product";

export type ProductActionResult = { ok: true } | { ok: false; message: string };

const visibilitySchema = z.object({
  productId: z.string().refine((value) => mongoose.isValidObjectId(value)),
  isActive: z.boolean(),
});

const deleteSchema = z.object({
  productId: z.string().refine((value) => mongoose.isValidObjectId(value)),
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
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

// The shop address (slug) stays the same on edit, so existing links never break.
export async function updateProductAction(
  productId: string,
  payload: unknown,
): Promise<ProductFormResult> {
  await requireAdmin(); // the lock: always first

  if (!mongoose.isValidObjectId(productId)) {
    return { ok: false, message: "Invalid request." };
  }

  const checked = parseProductInput(payload);
  if (!checked.ok) return checked.result;
  const input = checked.input;

  try {
    await connectToDatabase();
    const result = await Product.updateOne(
      { _id: productId },
      {
        $set: {
          brand: input.brand,
          name: input.name,
          description: input.description,
          scentFamilies: input.scentFamilies,
          images: input.images,
          variants: input.variants,
          featured: input.featured,
          isActive: input.isActive,
        },
      },
    );
    if (result.matchedCount === 0) {
      return { ok: false, message: "Product not found." };
    }
  } catch (error) {
    console.error("update product failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

// Old orders keep their own copy of name and price, so deleting is safe for
// order history. Hiding is the reversible alternative.
export async function deleteProductAction(
  payload: unknown,
): Promise<ProductActionResult> {
  await requireAdmin(); // the lock: always first

  const parsed = deleteSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  try {
    await connectToDatabase();
    const result = await Product.deleteOne({ _id: parsed.data.productId });
    if (result.deletedCount === 0) {
      return { ok: false, message: "Product not found." };
    }
  } catch (error) {
    console.error("delete product failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}
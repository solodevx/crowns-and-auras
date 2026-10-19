"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import {
  productInputSchema,
  type ProductFormResult,
} from "@/lib/product-validators";
import { slugify } from "@/lib/slug";
import { Product } from "@/models/Product";

export async function createProductAction(
  payload: unknown,
): Promise<ProductFormResult> {
  await requireAdmin(); // the lock: always first

  const parsed = productInputSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  const input = parsed.data;
  const slug = slugify(`${input.brand} ${input.name}`);
  if (!slug) {
    return {
      ok: false,
      message: "Enter a brand and name using letters or numbers.",
    };
  }

  try {
    await connectToDatabase();
    await Product.create({
      slug,
      brand: input.brand,
      name: input.name,
      description: input.description,
      scentFamilies: input.scentFamilies,
      images: [],
      variants: input.variants,
      featured: input.featured,
      isActive: input.isActive,
    });
  } catch (error) {
    // 11000 = the database says "that must be unique, and it already exists"
    if (typeof error === "object" && error !== null && "code" in error) {
      if (error.code === 11000) {
        return {
          ok: false,
          message: "A perfume with this brand and name already exists.",
        };
      }
    }
    console.error("create product failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}
"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import {
  countOtherActiveFeatured,
  featuredFullResult,
  HOMEPAGE_FEATURED_LIMIT,
} from "@/lib/featured-limit";
import { parseProductInput } from "@/lib/parse-product-input";
import type { ProductFormResult } from "@/lib/product-validators";
import { slugify } from "@/lib/slug";
import { Product } from "@/models/Product";

const duplicateResult: ProductFormResult = {
  ok: false,
  message: "A perfume with this brand and name already exists.",
};

export async function createProductAction(
  payload: unknown,
): Promise<ProductFormResult> {
  await requireAdmin(); // the lock: always first

  const checked = parseProductInput(payload);
  if (!checked.ok) return checked.result;
  const input = checked.input;

  const slug = slugify(`${input.brand} ${input.name}`);
  if (!slug) {
    return {
      ok: false,
      message: "Enter a brand and name using letters or numbers.",
    };
  }

  try {
    await connectToDatabase();

    // The address must not be in use now, or be an old address of another perfume
    const taken = await Product.exists({
      $or: [{ slug }, { previousSlugs: slug }],
    });
    if (taken) return duplicateResult;

    // The homepage can only show so many featured perfumes
    if (input.featured && input.isActive) {
      const others = await countOtherActiveFeatured(null);
      if (others >= HOMEPAGE_FEATURED_LIMIT) return featuredFullResult;
    }

    await Product.create({
      slug,
      previousSlugs: [],
      brand: input.brand,
      name: input.name,
      description: input.description,
      scentFamilies: input.scentFamilies,
      images: input.images,
      variants: input.variants,
      featured: input.featured,
      isActive: input.isActive,
    });
  } catch (error) {
    // 11000 = the database says "that must be unique, and it already exists"
    if (typeof error === "object" && error !== null && "code" in error) {
      if (error.code === 11000) return duplicateResult;
    }
    console.error("create product failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}
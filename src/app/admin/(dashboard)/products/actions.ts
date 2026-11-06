"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import {
  countOtherActiveFeatured,
  featuredFullMessage,
  featuredFullResult,
  HOMEPAGE_FEATURED_LIMIT,
} from "@/lib/featured-limit";
import { parseProductInput } from "@/lib/parse-product-input";
import { brandMissingResult, findBrandForProduct } from "@/lib/product-brand";
import { buildUniqueProductSlug, rememberOldSlug } from "@/lib/product-slug";
import type { ProductFormResult } from "@/lib/product-validators";
import { slugify } from "@/lib/slug";
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
  const productObjectId = new mongoose.Types.ObjectId(parsed.data.productId);

  try {
    await connectToDatabase();

    // Showing a featured perfume puts it on the homepage, so it needs a free spot
    if (parsed.data.isActive) {
      const target = await Product.findById(productObjectId, {
        featured: 1,
      }).lean();
      if (!target) return { ok: false, message: "Product not found." };

      if (target.featured) {
        const others = await countOtherActiveFeatured(productObjectId);
        if (others >= HOMEPAGE_FEATURED_LIMIT) {
          return { ok: false, message: featuredFullMessage };
        }
      }
    }

    const result = await Product.updateOne(
      { _id: productObjectId },
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

// The web address follows the brand name and the perfume name.
// The old address is remembered, so old links redirect to the new one.
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
  const productObjectId = new mongoose.Types.ObjectId(productId);

  try {
    await connectToDatabase();

    const existing = await Product.findById(productObjectId, {
      slug: 1,
      previousSlugs: 1,
    }).lean();
    if (!existing) return { ok: false, message: "Product not found." };

    // The brand must be a real brand record
    const brand = await findBrandForProduct(input.brandId);
    if (!brand) return brandMissingResult;

    if (!slugify(`${brand.name} ${input.name}`)) {
      return {
        ok: false,
        message: "Enter a perfume name using letters or numbers.",
      };
    }

    // The homepage can only show so many featured perfumes
    if (input.featured && input.isActive) {
      const others = await countOtherActiveFeatured(productObjectId);
      if (others >= HOMEPAGE_FEATURED_LIMIT) return featuredFullResult;
    }

    const newSlug = await buildUniqueProductSlug(
      brand.name,
      input.name,
      productObjectId,
    );

    await Product.updateOne(
      { _id: productObjectId },
      {
        $set: {
          slug: newSlug,
          previousSlugs: rememberOldSlug(
            existing.previousSlugs,
            existing.slug,
            newSlug,
          ),
          brandId: brand.id,
          brand: brand.name,
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
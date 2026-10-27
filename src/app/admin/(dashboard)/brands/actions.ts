"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { brandNameKey, HOMEPAGE_BRAND_LIMIT } from "@/lib/brand-rules";
import {
  brandInputSchema,
  type BrandFormResult,
  type BrandInput,
} from "@/lib/brand-validators";
import { isOwnImageUrl } from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/db";
import { syncProductsWithBrand } from "@/lib/product-slug";
import { Brand } from "@/models/Brand";
import { Product } from "@/models/Product";

export type BrandActionResult = { ok: true } | { ok: false; message: string };

type Failure = Extract<BrandFormResult, { ok: false }>;

const homepageFullMessage = `The homepage is full: ${HOMEPAGE_BRAND_LIMIT} brands are already featured. Unfeature one first.`;

function parseBrandInput(
  payload: unknown,
): { ok: true; input: BrandInput } | { ok: false; result: Failure } {
  const parsed = brandInputSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return {
      ok: false,
      result: {
        ok: false,
        message: "Please check the highlighted fields.",
        fieldErrors,
      },
    };
  }

  // Only accept images that really live in OUR Cloudinary account
  if (parsed.data.imageUrl && !isOwnImageUrl(parsed.data.imageUrl)) {
    return {
      ok: false,
      result: {
        ok: false,
        message: "The image is not from our image library.",
        fieldErrors: { imageUrl: "Please upload the image again." },
      },
    };
  }

  return { ok: true, input: parsed.data };
}

// MongoDB error code 11000 means "that must be unique, and it already exists"
function isDuplicateKey(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

// The rules that need the database. Returns a failure, or null when all is fine.
async function findBrandProblem(
  input: BrandInput,
  excludeId: mongoose.Types.ObjectId | null,
): Promise<Failure | null> {
  // A brand being edited must not clash with itself. A fresh random id matches nothing.
  const self = excludeId ?? new mongoose.Types.ObjectId();

  // 1. The same name, however it is written
  const key = brandNameKey(input.name);
  if (!key) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      fieldErrors: { name: "Use letters or numbers in the name." },
    };
  }
  const others = await Brand.find({ _id: { $ne: self } }, { name: 1 }).lean();
  const sameName = others.find(
    (other) => brandNameKey(other.name ?? "") === key,
  );
  if (sameName) {
    return {
      ok: false,
      message: `A brand called "${sameName.name}" already exists.`,
      fieldErrors: {
        name: `Too close to the existing brand "${sameName.name}".`,
      },
    };
  }

  // 2. A web address already used by another brand, now or in the past
  const sameAddress = await Brand.findOne(
    {
      _id: { $ne: self },
      $or: [{ slug: input.slug }, { previousSlugs: input.slug }],
    },
    { name: 1 },
  ).lean();
  if (sameAddress) {
    return {
      ok: false,
      message: "That web address is already used by another brand.",
      fieldErrors: { slug: "Already used. Try a different address." },
    };
  }

  // 3. The homepage can only show so many featured brands
  if (input.isActive && input.isFeatured) {
    const shown = await Brand.countDocuments({
      _id: { $ne: self },
      isActive: true,
      isFeatured: true,
    });
    if (shown >= HOMEPAGE_BRAND_LIMIT) {
      return {
        ok: false,
        message: homepageFullMessage,
        fieldErrors: { isFeatured: homepageFullMessage },
      };
    }
  }

  return null;
}

const duplicateSlugResult: Failure = {
  ok: false,
  message: "That web address is already used by another brand.",
  fieldErrors: { slug: "Already used. Try a different address." },
};

export async function createBrandAction(
  payload: unknown,
): Promise<BrandFormResult> {
  await requireAdmin(); // the lock: always first

  const checked = parseBrandInput(payload);
  if (!checked.ok) return checked.result;

  try {
    await connectToDatabase();
    const problem = await findBrandProblem(checked.input, null);
    if (problem) return problem;

    await Brand.create({ ...checked.input, previousSlugs: [] });
  } catch (error) {
    if (isDuplicateKey(error)) return duplicateSlugResult;
    console.error("create brand failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function updateBrandAction(
  brandId: string,
  payload: unknown,
): Promise<BrandFormResult> {
  await requireAdmin(); // the lock: always first

  if (!mongoose.isValidObjectId(brandId)) {
    return { ok: false, message: "Invalid request." };
  }

  const checked = parseBrandInput(payload);
  if (!checked.ok) return checked.result;
  const input = checked.input;
  const brandObjectId = new mongoose.Types.ObjectId(brandId);

  try {
    await connectToDatabase();

    const existing = await Brand.findById(brandObjectId).lean();
    if (!existing) return { ok: false, message: "Brand not found." };

    const problem = await findBrandProblem(input, brandObjectId);
    if (problem) return problem;

    // If the address changed, remember the old one so old links can redirect.
    // If it changed back to an old one, that one is no longer "old".
    let previousSlugs = (existing.previousSlugs ?? []).filter(
      (slug) => slug !== input.slug,
    );
    if (existing.slug && existing.slug !== input.slug) {
      previousSlugs = [...previousSlugs, existing.slug];
    }
    previousSlugs = [...new Set(previousSlugs)].slice(-20);

    await Brand.updateOne(
      { _id: brandObjectId },
      { $set: { ...input, previousSlugs } },
    );

    // Every perfume of this brand gets the new name, and its address follows
    await syncProductsWithBrand(brandObjectId, input.name);
  } catch (error) {
    if (isDuplicateKey(error)) return duplicateSlugResult;
    console.error("update brand failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

const toggleSchema = z.object({
  brandId: z.string().refine((value) => mongoose.isValidObjectId(value)),
  field: z.enum(["isActive", "isFeatured"]),
  value: z.boolean(),
});

export async function toggleBrandAction(
  payload: unknown,
): Promise<BrandActionResult> {
  await requireAdmin(); // the lock: always first

  const parsed = toggleSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, message: "Invalid request." };
  const brandObjectId = new mongoose.Types.ObjectId(parsed.data.brandId);

  try {
    await connectToDatabase();

    const brand = await Brand.findById(brandObjectId, {
      isActive: 1,
      isFeatured: 1,
    }).lean();
    if (!brand) return { ok: false, message: "Brand not found." };

    const nextActive =
      parsed.data.field === "isActive"
        ? parsed.data.value
        : (brand.isActive ?? true);
    const nextFeatured =
      parsed.data.field === "isFeatured"
        ? parsed.data.value
        : (brand.isFeatured ?? false);

    // A brand that would appear on the homepage needs a free spot
    if (nextActive && nextFeatured) {
      const shown = await Brand.countDocuments({
        _id: { $ne: brandObjectId },
        isActive: true,
        isFeatured: true,
      });
      if (shown >= HOMEPAGE_BRAND_LIMIT) {
        return { ok: false, message: homepageFullMessage };
      }
    }

    await Brand.updateOne(
      { _id: brandObjectId },
      { $set: { [parsed.data.field]: parsed.data.value } },
    );
  } catch (error) {
    console.error("toggle brand failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}

const deleteSchema = z.object({
  brandId: z.string().refine((value) => mongoose.isValidObjectId(value)),
});

// A brand that still has products cannot be deleted: nothing is left pointing nowhere.
export async function deleteBrandAction(
  payload: unknown,
): Promise<BrandActionResult> {
  await requireAdmin(); // the lock: always first

  const parsed = deleteSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, message: "Invalid request." };
  const brandObjectId = new mongoose.Types.ObjectId(parsed.data.brandId);

  try {
    await connectToDatabase();

    const productCount = await Product.countDocuments({
      brandId: brandObjectId,
    });
    if (productCount > 0) {
      return {
        ok: false,
        message: `This brand still has ${productCount} product${productCount === 1 ? "" : "s"}. Move or delete them first, or deactivate the brand instead.`,
      };
    }

    const result = await Brand.deleteOne({ _id: brandObjectId });
    if (result.deletedCount === 0) {
      return { ok: false, message: "Brand not found." };
    }
  } catch (error) {
    console.error("delete brand failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}
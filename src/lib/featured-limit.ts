import "server-only";
import mongoose from "mongoose";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import type { ProductFormResult } from "@/lib/product-validators";
import { Product } from "@/models/Product";

// The homepage shows at most this many featured perfumes
export const HOMEPAGE_FEATURED_LIMIT = 6;

export const featuredFullMessage = `The homepage is full: ${HOMEPAGE_FEATURED_LIMIT} perfumes are already featured. Untick one first.`;

export const featuredFullResult: ProductFormResult = {
  ok: false,
  message: featuredFullMessage,
  fieldErrors: { featured: featuredFullMessage },
};

// How many OTHER visible, featured perfumes there are (for the server actions,
// where the database connection is already open)
export async function countOtherActiveFeatured(
  excludeId: mongoose.Types.ObjectId | null,
): Promise<number> {
  // A fresh random id matches nothing, so a new perfume excludes nobody
  const self = excludeId ?? new mongoose.Types.ObjectId();
  return Product.countDocuments({
    featured: true,
    isActive: true,
    _id: { $ne: self },
  });
}

// The same count, for the admin pages
export async function getFeaturedCountForPage(
  excludeId?: string,
): Promise<number> {
  await requireAdmin(); // lock the data door
  await connection();
  await connectToDatabase();

  const self =
    excludeId && mongoose.isValidObjectId(excludeId)
      ? new mongoose.Types.ObjectId(excludeId)
      : null;
  return countOtherActiveFeatured(self);
}
import { connection } from "next/server";
import { HOMEPAGE_BRAND_LIMIT } from "@/lib/brand-rules";
import { connectToDatabase } from "@/lib/db";
import { Brand as BrandModel } from "@/models/Brand";

export type PublicBrand = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
};

// Almost everything is optional on purpose: the database can't promise a
// field exists, so we fill in a safe default when we convert it.
type BrandRecord = {
  _id: { toString(): string };
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
};

function toBrand(record: BrandRecord): PublicBrand {
  return {
    id: record._id.toString(),
    name: record.name ?? "",
    slug: record.slug ?? "",
    description: record.description ?? "",
    imageUrl: record.imageUrl ?? "",
  };
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isValidSlug(slug: string): boolean {
  return slug.length > 0 && slug.length <= 80 && SLUG_PATTERN.test(slug);
}

// The brands the owner has featured (the pool the home page picks from)
export async function getFeaturedBrands(): Promise<PublicBrand[]> {
  await connection();
  await connectToDatabase();
  const records = await BrandModel.find({ isActive: true, isFeatured: true })
    .sort({ displayOrder: 1, name: 1 })
    .limit(HOMEPAGE_BRAND_LIMIT)
    .lean();
  return records.map(toBrand);
}

// Every active brand, for the directory and the sitemap
export async function getActiveBrands(): Promise<PublicBrand[]> {
  await connection();
  await connectToDatabase();
  const records = await BrandModel.find({ isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .lean();
  return records.map(toBrand);
}

export async function getBrandBySlug(
  slug: string,
): Promise<PublicBrand | null> {
  if (!isValidSlug(slug)) return null;
  await connection();
  await connectToDatabase();
  const record = await BrandModel.findOne({ slug, isActive: true }).lean();
  return record ? toBrand(record) : null;
}

// For an old web address: the brand's current address, or null if none
export async function getBrandCurrentSlug(
  oldSlug: string,
): Promise<string | null> {
  if (!isValidSlug(oldSlug)) return null;
  await connection();
  await connectToDatabase();
  const record = await BrandModel.findOne(
    { previousSlugs: oldSlug, isActive: true },
    { slug: 1 },
  ).lean();
  return record?.slug ?? null;
}
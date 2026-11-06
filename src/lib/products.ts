import mongoose from "mongoose";
import { connection } from "next/server";
import type { ScentFamily } from "@/config/scents";
import { noteSlugs, type NoteSlug } from "@/config/notes";
import { connectToDatabase } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { sortVariantsBySize } from "@/lib/variants";
import { Brand as BrandModel } from "@/models/Brand";
import { Product as ProductModel } from "@/models/Product";
import type { Product } from "@/types/product";

// What a perfume looks like when it comes out of the database
type ProductRecord = {
  _id: { toString(): string };
  brandId?: { toString(): string } | null;
  slug: string;
  brand: string;
  name: string;
  description?: string | null;
  scentFamilies: string[];
  images: string[];
  variants: { size: string; price: number; available?: boolean | null }[];
  featured?: boolean | null;
  notes?: string[] | null;
};

// Which brands are switched off, and each brand's web address.
// A perfume of an inactive brand is hidden from the whole public site.
async function loadBrandRules() {
  const brands = await BrandModel.find({}, { slug: 1, isActive: 1 }).lean();
  const inactiveIds = brands
    .filter((brand) => brand.isActive === false)
    .map((brand) => brand._id);
  const slugById = new Map<string, string>(
    brands.map((brand): [string, string] => [
      brand._id.toString(),
      brand.slug ?? "",
    ]),
  );
  return { inactiveIds, slugById };
}

// Turns a database record into the plain Product the rest of the shop uses.
function toProduct(
  record: ProductRecord,
  slugById: Map<string, string>,
): Product {
  const linkedSlug = record.brandId
    ? slugById.get(record.brandId.toString())
    : "";
  return {
    id: record._id.toString(),
    slug: record.slug,
    brand: record.brand,
    // A perfume not linked to a brand record falls back to its brand's name
    brandSlug: linkedSlug || slugify(record.brand),
    name: record.name,
    description: record.description ?? "",
    scentFamilies: record.scentFamilies as ScentFamily[],
    images: record.images,
    variants: sortVariantsBySize(
      record.variants.map((variant) => ({
        size: variant.size,
        price: variant.price,
        available: variant.available ?? true,
      })),
    ),
    featured: record.featured ?? false,
    notes: (record.notes ?? []).filter((note): note is NoteSlug =>
      (noteSlugs as readonly string[]).includes(note),
    ),
  };
}

// The three functions below are for PAGES, so they say "do this live" first.
export async function getProducts(): Promise<Product[]> {
  await connection();
  await connectToDatabase();
  const rules = await loadBrandRules();
  const records = await ProductModel.find({
    isActive: true,
    brandId: { $nin: rules.inactiveIds },
  })
    .sort({ createdAt: -1 })
    .lean();
  return records.map((record) => toProduct(record, rules.slugById));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await connection();
  await connectToDatabase();
  const rules = await loadBrandRules();
  const records = await ProductModel.find({
    isActive: true,
    featured: true,
    brandId: { $nin: rules.inactiveIds },
  })
    .sort({ createdAt: -1 })
    .lean();
  return records.map((record) => toProduct(record, rules.slugById));
}

// Used when the server prices an order (inside a Server Action, not a page).
export async function getProductById(
  productId: string,
): Promise<Product | null> {
  // The id arrives from the customer's browser, so check it looks right first
  if (!mongoose.isValidObjectId(productId)) return null;

  await connectToDatabase();
  const rules = await loadBrandRules();
  const record = await ProductModel.findOne({
    _id: productId,
    isActive: true,
    brandId: { $nin: rules.inactiveIds },
  }).lean();
  return record ? toProduct(record, rules.slugById) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!slug) return null;
  await connection();
  await connectToDatabase();
  const rules = await loadBrandRules();
  const record = await ProductModel.findOne({
    slug,
    isActive: true,
    brandId: { $nin: rules.inactiveIds },
  }).lean();
  return record ? toProduct(record, rules.slugById) : null;
}

// For an old web address: the perfume's current address, or null if none.
export async function getCurrentSlugForOldAddress(
  oldSlug: string,
): Promise<string | null> {
  await connection();
  await connectToDatabase();
  const rules = await loadBrandRules();
  const record = await ProductModel.findOne(
    {
      previousSlugs: oldSlug,
      isActive: true,
      brandId: { $nin: rules.inactiveIds },
    },
    { slug: 1 },
  ).lean();
  return record?.slug ?? null;
}
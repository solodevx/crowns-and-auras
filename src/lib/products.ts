import mongoose from "mongoose";
import { connection } from "next/server";
import type { ScentFamily } from "@/config/scents";
import { connectToDatabase } from "@/lib/db";
import { Product as ProductModel } from "@/models/Product";
import type { Product } from "@/types/product";


type ProductRecord = {
  _id: { toString(): string };
  slug: string;
  brand: string;
  name: string;
  description?: string | null;
  scentFamilies: string[];
  images: string[];
  variants: { size: string; price: number; available?: boolean | null }[];
  featured?: boolean | null;
};

// Turns a database record into the plain Product 
function toProduct(record: ProductRecord): Product {
  return {
    id: record._id.toString(),
    slug: record.slug,
    brand: record.brand,
    name: record.name,
    description: record.description ?? "",
    scentFamilies: record.scentFamilies as ScentFamily[],
    images: record.images,
    variants: record.variants.map((variant) => ({
      size: variant.size,
      price: variant.price,
      available: variant.available ?? true,
    })),
    featured: record.featured ?? false,
  };
}

// The three functions below are for PAGES, so they say "do this live" first.
export async function getProducts(): Promise<Product[]> {
  await connection();
  await connectToDatabase();
  const records = await ProductModel.find({ isActive: true })
    .sort({ createdAt: -1 })
    .lean();
  return records.map(toProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  await connection();
  await connectToDatabase();
  const records = await ProductModel.find({ isActive: true, featured: true })
    .sort({ createdAt: -1 })
    .lean();
  return records.map(toProduct);
}

// Used when the server prices an order (inside a Server Action, not a page).
export async function getProductById(productId: string): Promise<Product | null> {
  // The id arrives from the customer's browser, so check it looks right first
  if (!mongoose.isValidObjectId(productId)) return null;

  await connectToDatabase();
  const record = await ProductModel.findOne({
    _id: productId,
    isActive: true,
  }).lean();
  return record ? toProduct(record) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!slug) return null;
  await connection();
  await connectToDatabase();
  const record = await ProductModel.findOne({ slug, isActive: true }).lean();
  return record ? toProduct(record) : null;
}
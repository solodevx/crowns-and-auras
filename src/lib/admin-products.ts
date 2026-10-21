import "server-only";
import mongoose from "mongoose";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Product as ProductModel } from "@/models/Product";
import { sortVariantsBySize } from "@/lib/variants";

type VariantRecord = {
  size?: string | null;
  price?: number | null;
  available?: boolean | null;
};

// Almost everything is optional on purpose: the database can't promise a
// field exists, so we fill in a safe default when we convert it.
type ProductRecord = {
  _id: { toString(): string };
  slug?: string | null;
  brand?: string | null;
  name?: string | null;
  description?: string | null;
  scentFamilies?: string[] | null;
  variants?: VariantRecord[] | null;
  featured?: boolean | null;
  isActive?: boolean | null;
};

function toVariants(variants: VariantRecord[] | null | undefined) {
  return sortVariantsBySize(
    (variants ?? []).map((variant) => ({
      size: variant.size ?? "",
      price: variant.price ?? 0,
      available: variant.available ?? true,
    })),
  );
}

// ── The list ──

export type AdminProductRow = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  sizes: { size: string; price: number; available: boolean }[];
  featured: boolean;
  isActive: boolean;
};

function toRow(record: ProductRecord): AdminProductRow {
  return {
    id: record._id.toString(),
    slug: record.slug ?? "",
    brand: record.brand ?? "",
    name: record.name ?? "",
    sizes: toVariants(record.variants),
    featured: record.featured ?? false,
    isActive: record.isActive ?? true,
  };
}

// Unlike the public shop, the admin sees hidden products too.
export async function getAdminProducts(): Promise<AdminProductRow[]> {
  await requireAdmin(); // lock the data door
  await connection();
  await connectToDatabase();

  const records = await ProductModel.find({})
    .sort({ brand: 1, name: 1 })
    .lean();
  return records.map(toRow);
}

// ── One product, for editing ──

export type AdminProductEdit = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  description: string;
  scentFamilies: string[];
  variants: { size: string; price: number; available: boolean }[];
  featured: boolean;
  isActive: boolean;
};

function toEdit(record: ProductRecord): AdminProductEdit {
  return {
    id: record._id.toString(),
    slug: record.slug ?? "",
    brand: record.brand ?? "",
    name: record.name ?? "",
    description: record.description ?? "",
    scentFamilies: record.scentFamilies ?? [],
    variants: toVariants(record.variants),
    featured: record.featured ?? false,
    isActive: record.isActive ?? true,
  };
}

export async function getAdminProductForEdit(
  id: string,
): Promise<AdminProductEdit | null> {
  await requireAdmin(); // lock the data door
  if (!mongoose.isValidObjectId(id)) return null;

  await connection();
  await connectToDatabase();
  const record = await ProductModel.findById(id).lean();
  return record ? toEdit(record) : null;
}
import "server-only";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Product as ProductModel } from "@/models/Product";

export type AdminProductRow = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  sizes: { size: string; price: number; available: boolean }[];
  featured: boolean;
  isActive: boolean;
};

// Almost everything is optional on purpose: the database can't promise a
// field exists, so we fill in a safe default when we convert it.
type ProductRecord = {
  _id: { toString(): string };
  slug?: string | null;
  brand?: string | null;
  name?: string | null;
  variants?:
    | {
        size?: string | null;
        price?: number | null;
        available?: boolean | null;
      }[]
    | null;
  featured?: boolean | null;
  isActive?: boolean | null;
};

function toRow(record: ProductRecord): AdminProductRow {
  return {
    id: record._id.toString(),
    slug: record.slug ?? "",
    brand: record.brand ?? "",
    name: record.name ?? "",
    sizes: (record.variants ?? []).map((variant) => ({
      size: variant.size ?? "",
      price: variant.price ?? 0,
      available: variant.available ?? true,
    })),
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
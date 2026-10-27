import "server-only";
import mongoose from "mongoose";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { Brand as BrandModel } from "@/models/Brand";
import { Product as ProductModel } from "@/models/Product";

// Almost everything is optional on purpose: the database can't promise a
// field exists, so we fill in a safe default when we convert it.
type BrandRecord = {
  _id: { toString(): string };
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean | null;
  isFeatured?: boolean | null;
  displayOrder?: number | null;
};

export type AdminBrandRow = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  productCount: number;
};

function toRow(record: BrandRecord, productCount: number): AdminBrandRow {
  return {
    id: record._id.toString(),
    name: record.name ?? "",
    slug: record.slug ?? "",
    imageUrl: record.imageUrl ?? "",
    isActive: record.isActive ?? true,
    isFeatured: record.isFeatured ?? false,
    displayOrder: record.displayOrder ?? 0,
    productCount,
  };
}

export async function getAdminBrands(): Promise<AdminBrandRow[]> {
  await requireAdmin(); // lock the data door
  await connection();
  await connectToDatabase();

  const [records, counts] = await Promise.all([
    BrandModel.find({}).sort({ displayOrder: 1, name: 1 }).lean(),
    ProductModel.aggregate<{
      _id: mongoose.Types.ObjectId | null;
      count: number;
    }>([
      { $match: { brandId: { $ne: null } } },
      { $group: { _id: "$brandId", count: { $sum: 1 } } },
    ]),
  ]);

  const countByBrand = new Map<string, number>(
    counts
      .filter((item) => item._id !== null)
      .map((item): [string, number] => [String(item._id), item.count]),
  );

  return records.map((record) =>
    toRow(record, countByBrand.get(record._id.toString()) ?? 0),
  );
}

export type AdminBrandEdit = AdminBrandRow & { description: string };

export async function getAdminBrandForEdit(
  id: string,
): Promise<AdminBrandEdit | null> {
  await requireAdmin(); // lock the data door
  if (!mongoose.isValidObjectId(id)) return null;

  await connection();
  await connectToDatabase();

  const record = await BrandModel.findById(id).lean();
  if (!record) return null;

  const productCount = await ProductModel.countDocuments({
    brandId: record._id,
  });
  return {
    ...toRow(record, productCount),
    description: record.description ?? "",
  };
}
import "server-only";
import mongoose from "mongoose";
import type { ProductFormResult } from "@/lib/product-validators";
import { Brand } from "@/models/Brand";

// Checks on the server that the chosen brand really exists
export async function findBrandForProduct(
  brandId: string,
): Promise<{ id: mongoose.Types.ObjectId; name: string } | null> {
  if (!mongoose.isValidObjectId(brandId)) return null;
  const brand = await Brand.findById(brandId, { name: 1 }).lean();
  if (!brand || !brand.name) return null;
  return { id: brand._id, name: brand.name };
}

export const brandMissingResult: ProductFormResult = {
  ok: false,
  message: "Please choose a brand from the list.",
  fieldErrors: { brandId: "Choose a brand from the list." },
};
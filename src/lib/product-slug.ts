import mongoose from "mongoose";
import { slugify } from "@/lib/slug";
import { Product } from "@/models/Product";

// A perfume's web address is made from its brand name and its own name.
// If that address is taken (now, or as an old address of another perfume),
// a number is added at the end.
export async function buildUniqueProductSlug(
  brandName: string,
  productName: string,
  excludeId: mongoose.Types.ObjectId | null,
): Promise<string> {
  const base = slugify(`${brandName} ${productName}`);
  if (!base) throw new Error("Cannot build a web address from an empty name");

  // A fresh random id matches nothing, so a new perfume excludes nobody
  const self = excludeId ?? new mongoose.Types.ObjectId();

  for (let attempt = 1; attempt <= 50; attempt += 1) {
    const candidate = attempt === 1 ? base : `${base}-${attempt}`;
    const taken = await Product.exists({
      _id: { $ne: self },
      $or: [{ slug: candidate }, { previousSlugs: candidate }],
    });
    if (!taken) return candidate;
  }
  throw new Error("Could not find a free web address");
}

// Adds the old address to the list of old addresses (never the current one)
export function rememberOldSlug(
  previous: string[] | null | undefined,
  oldSlug: string | null | undefined,
  newSlug: string,
): string[] {
  let result = (previous ?? []).filter((slug) => slug !== newSlug);
  if (oldSlug && oldSlug !== newSlug) result = [...result, oldSlug];
  return [...new Set(result)].slice(-20);
}

// After a brand is renamed (or to repair old data): every one of its perfumes
// gets the new brand name, and its web address follows. Returns how many
// addresses changed.
export async function syncProductsWithBrand(
  brandId: mongoose.Types.ObjectId,
  brandName: string,
): Promise<number> {
  await Product.updateMany({ brandId }, { $set: { brand: brandName } });

  const products = await Product.find(
    { brandId },
    { name: 1, slug: 1, previousSlugs: 1 },
  ).lean();

  let changed = 0;
  for (const product of products) {
    const newSlug = await buildUniqueProductSlug(
      brandName,
      product.name ?? "",
      product._id,
    );
    if (newSlug === product.slug) continue;

    await Product.updateOne(
      { _id: product._id },
      {
        $set: {
          slug: newSlug,
          previousSlugs: rememberOldSlug(
            product.previousSlugs,
            product.slug,
            newSlug,
          ),
        },
      },
    );
    changed += 1;
  }
  return changed;
}
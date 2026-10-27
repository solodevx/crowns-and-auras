import { slugify } from "@/lib/slug";

// The homepage shows at most this many featured brands
export const HOMEPAGE_BRAND_LIMIT = 6;

// "Maison Aurelle", "maison  aurelle" and "MAISON-AURELLE!" all give the same
// key, so they count as the same brand.
export function brandNameKey(name: string): string {
  return slugify(name);
}
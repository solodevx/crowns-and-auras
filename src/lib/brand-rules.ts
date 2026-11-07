import { slugify } from "@/lib/slug";

// The most brands that can be marked featured. The home page picks a few of
// them at random each visit (see config/homepage.ts).
export const HOMEPAGE_BRAND_LIMIT = 10;

// "Maison Aurelle", "maison  aurelle" and "MAISON-AURELLE!" all give the same
// key, so they count as the same brand.
export function brandNameKey(name: string): string {
  return slugify(name);
}
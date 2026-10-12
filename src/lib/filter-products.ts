import { scentFamilies, type ScentFamily } from "@/config/scents";
import type { Product } from "@/types/product";

export type SearchParams = Record<string, string | string[] | undefined>;

export type ProductFilters = {
  q: string; // text typed in the search box
  brand: string; // "" means all brands
  scents: ScentFamily[]; // empty means any scent
};

// A URL value can be missing, one string, or a list (?scent=A&scent=B).
// This turns all three into a list so the rest of the code has one case to handle.
function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

// Turns raw URL text into trusted filters.
// Anyone can type ?scent=banana in the address bar, so we keep only valid scents.
// This is your first taste of VALIDATION: never trust what arrives from outside.
export function parseFilters(params: SearchParams): ProductFilters {
  const [q = ""] = toArray(params.q);
  const [brand = ""] = toArray(params.brand);
  const scents = toArray(params.scent).filter((scent): scent is ScentFamily =>
    (scentFamilies as readonly string[]).includes(scent),
  );
  return { q: q.trim(), brand, scents };
}

// A Set is a list that drops duplicates. Handy for "which brands exist?"
export function getBrands(products: Product[]): string[] {
  return [...new Set(products.map((product) => product.brand))].sort();
}

// ─────────────────────────────────────────────
// YOUR TURN: write this function.
// ─────────────────────────────────────────────
export function filterProducts(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  // TODO
  return products;
}
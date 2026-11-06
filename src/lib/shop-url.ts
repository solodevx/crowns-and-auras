import { DEFAULT_SORT, type ProductFilters } from "@/lib/filter-products";

// Builds a shop address from the current filters, with some of them changed.
export function buildShopHref(
  filters: ProductFilters,
  changes: Partial<ProductFilters> = {},
): string {
  const next = { ...filters, ...changes };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  for (const brand of next.brands) params.append("brand", brand);
  for (const scent of next.scents) params.append("scent", scent);
  if (next.minPrice !== null) params.set("min", String(next.minPrice));
  if (next.maxPrice !== null) params.set("max", String(next.maxPrice));
  if (next.onlyAvailable) params.set("available", "1");
  if (next.sort !== DEFAULT_SORT) params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}
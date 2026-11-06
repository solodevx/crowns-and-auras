import { scentFamilies, type ScentFamily } from "@/config/scents";
import { getStartingPrice, isProductAvailable } from "@/lib/product";
import type { Product } from "@/types/product";

export type SearchParams = Record<string, string | string[] | undefined>;

export const SORT_OPTIONS = [
  { value: "newest", label: "New arrivals" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export const DEFAULT_SORT: SortValue = "newest";

// 12 = a grid of 3 across and 4 down
export const PAGE_SIZE = 12;

export type ProductFilters = {
  q: string; // text typed in the search box
  brands: string[]; // brand web addresses. Empty means any brand
  scents: ScentFamily[]; // empty means any scent
  minPrice: number | null;
  maxPrice: number | null;
  onlyAvailable: boolean;
  sort: SortValue;
  page: number;
};

// A URL value can be missing, one string, or a list (?scent=A&scent=B).
// This turns all three into a list so the rest of the code has one case to handle.
function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function toPrice(value: string | undefined): number | null {
  if (!value) return null;
  const number = Number(value.replace(/[,\s]/g, ""));
  return Number.isFinite(number) && number >= 0 && number <= 10_000_000
    ? Math.floor(number)
    : null;
}

const BRAND_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Turns raw URL text into trusted filters.
// Anyone can type anything in the address bar, so we keep only valid values.
export function parseFilters(params: SearchParams): ProductFilters {
  const [q = ""] = toArray(params.q);

  const brands = [
    ...new Set(
      toArray(params.brand).filter(
        (value) => value.length <= 80 && BRAND_SLUG_PATTERN.test(value),
      ),
    ),
  ].slice(0, 20);

  const scents = [
    ...new Set(
      toArray(params.scent).filter((scent): scent is ScentFamily =>
        (scentFamilies as readonly string[]).includes(scent),
      ),
    ),
  ];

  const [minValue] = toArray(params.min);
  const [maxValue] = toArray(params.max);
  let minPrice = toPrice(minValue);
  let maxPrice = toPrice(maxValue);
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  const [availableValue] = toArray(params.available);
  const [sortValue] = toArray(params.sort);
  const sort =
    SORT_OPTIONS.find((option) => option.value === sortValue)?.value ??
    DEFAULT_SORT;

  const [pageValue] = toArray(params.page);
  const page = Math.max(
    1,
    Math.min(Number.parseInt(pageValue ?? "1", 10) || 1, 1000),
  );

  return {
    q: q.trim().slice(0, 100),
    brands,
    scents,
    minPrice,
    maxPrice,
    onlyAvailable: availableValue === "1",
    sort,
    page,
  };
}

// The brands that have at least one visible perfume, for the brand checklist
export function getBrandOptions(
  products: Product[],
): { slug: string; name: string }[] {
  const bySlug = new Map<string, string>();
  for (const product of products) {
    if (!bySlug.has(product.brandSlug))
      bySlug.set(product.brandSlug, product.brand);
  }
  return [...bySlug]
    .map(([slug, name]) => ({ slug, name }))
    .sort((first, second) => first.name.localeCompare(second.name));
}

function sortProducts(products: Product[], sort: SortValue): Product[] {
  const sorted = [...products];
  if (sort === "price-asc") {
    sorted.sort(
      (first, second) => getStartingPrice(first) - getStartingPrice(second),
    );
  } else if (sort === "price-desc") {
    sorted.sort(
      (first, second) => getStartingPrice(second) - getStartingPrice(first),
    );
  } else if (sort === "name") {
    sorted.sort((first, second) =>
      `${first.brand} ${first.name}`.localeCompare(
        `${second.brand} ${second.name}`,
      ),
    );
  }
  // "newest" keeps the order the products arrive in (newest first)
  return sorted;
}

// Decides which products match what the customer picked, in the order they asked for.
export function filterProducts(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  const searchText = filters.q.toLowerCase();
  const hasPrice = filters.minPrice !== null || filters.maxPrice !== null;

  const matches = products.filter((product) => {
    const matchesSearch =
      product.brand.toLowerCase().includes(searchText) ||
      product.name.toLowerCase().includes(searchText);

    const matchesBrand =
      filters.brands.length === 0 || filters.brands.includes(product.brandSlug);

    const matchesScent =
      filters.scents.length === 0 ||
      product.scentFamilies.some((scent) => filters.scents.includes(scent));

    // A perfume matches if any of its sizes fits the price range
    const matchesPrice =
      !hasPrice ||
      product.variants.some(
        (variant) =>
          (filters.minPrice === null || variant.price >= filters.minPrice) &&
          (filters.maxPrice === null || variant.price <= filters.maxPrice),
      );

    const matchesAvailability =
      !filters.onlyAvailable || isProductAvailable(product);

    return (
      matchesSearch &&
      matchesBrand &&
      matchesScent &&
      matchesPrice &&
      matchesAvailability
    );
  });

  return sortProducts(matches, filters.sort);
}

export function paginate<T>(
  items: T[],
  page: number,
  size: number = PAGE_SIZE,
) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(page, 1), totalPages);
  return {
    items: items.slice((current - 1) * size, current * size),
    page: current,
    totalPages,
  };
}
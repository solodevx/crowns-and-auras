import Link from "next/link";
import { X } from "lucide-react";
import { getScentName } from "@/config/scents";
import type { ProductFilters } from "@/lib/filter-products";
import { formatNaira } from "@/lib/format";
import { buildShopHref } from "@/lib/shop-url";

type ActiveFiltersProps = {
  filters: ProductFilters;
  brandNames: Map<string, string>;
};

type Chip = { label: string; href: string };

// The filters in use, each removable with one tap, plus "Clear all"
export default function ActiveFilters({
  filters,
  brandNames,
}: ActiveFiltersProps) {
  const chips: Chip[] = [];

  if (filters.q) {
    chips.push({
      label: `Search: ${filters.q}`,
      href: buildShopHref(filters, { q: "", page: 1 }),
    });
  }

  for (const scent of filters.scents) {
    chips.push({
      label: getScentName(scent),
      href: buildShopHref(filters, {
        scents: filters.scents.filter((item) => item !== scent),
        page: 1,
      }),
    });
  }

  for (const slug of filters.brands) {
    chips.push({
      label: brandNames.get(slug) ?? slug,
      href: buildShopHref(filters, {
        brands: filters.brands.filter((item) => item !== slug),
        page: 1,
      }),
    });
  }

  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const label =
      filters.minPrice !== null && filters.maxPrice !== null
        ? `${formatNaira(filters.minPrice)} to ${formatNaira(filters.maxPrice)}`
        : filters.minPrice !== null
          ? `From ${formatNaira(filters.minPrice)}`
          : `Up to ${formatNaira(filters.maxPrice ?? 0)}`;
    chips.push({
      label,
      href: buildShopHref(filters, { minPrice: null, maxPrice: null, page: 1 }),
    });
  }

  if (filters.onlyAvailable) {
    chips.push({
      label: "Available now",
      href: buildShopHref(filters, { onlyAvailable: false, page: 1 }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-ink/70">
        Filtered by
      </span>
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          aria-label={`Remove filter: ${chip.label}`}
          className="inline-flex h-11 items-center gap-2 border border-ink/25 bg-white/60 pl-3 pr-2 text-xs hover:border-ink sm:h-9"
        >
          {chip.label}
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      ))}
      <Link
        href="/shop"
        className="ml-1 inline-flex h-11 items-center text-xs uppercase tracking-[0.15em] underline underline-offset-4 sm:h-9"
      >
        Clear all
      </Link>
    </div>
  );
}
import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { getScentName, scentFamilies } from "@/config/scents";
import { DEFAULT_SORT, type ProductFilters } from "@/lib/filter-products";
import { buildShopHref } from "@/lib/shop-url";

type ShopFiltersProps = {
  brandOptions: { slug: string; name: string }[];
  filters: ProductFilters;
};

function FilterGroup({
  title,
  defaultOpen = false,
  clearHref,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  clearHref?: string;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group border border-ink/15 bg-white/50"
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-xs uppercase tracking-[0.2em] [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          className="h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </summary>
      <div className="px-4 pb-4">
        {clearHref && (
          <p className="mb-1 text-right">
            <Link
              href={clearHref}
              className="text-xs underline underline-offset-4"
            >
              Clear
            </Link>
          </p>
        )}
        {children}
      </div>
    </details>
  );
}

const checkRowClass =
  "flex min-h-10 cursor-pointer items-center gap-2.5 text-sm";
const priceInputClass =
  "h-11 w-full border border-ink/15 bg-white px-3 text-sm";

export default function ShopFilters({
  brandOptions,
  filters,
}: ShopFiltersProps) {
  // The boxes only read their starting state when they first appear. Giving the
  // form a key that changes with the chosen filters rebuilds it, so the ticks,
  // the search box and the prices always match the address in the browser.
  const formKey = [
    filters.q,
    filters.brands.join(","),
    filters.scents.join(","),
    filters.minPrice ?? "",
    filters.maxPrice ?? "",
    filters.onlyAvailable ? "1" : "0",
  ].join("|");

  return (
    <form key={formKey} method="get" action="/shop" className="space-y-3">
      <div>
        <label htmlFor="q" className="sr-only">
          Search perfumes
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/60"
            aria-hidden="true"
          />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Search"
            className="h-11 w-full border border-ink/15 bg-white/60 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      {filters.sort !== DEFAULT_SORT && (
        <input type="hidden" name="sort" value={filters.sort} />
      )}

      <FilterGroup
        title="Scent"
        defaultOpen
        clearHref={
          filters.scents.length > 0
            ? buildShopHref(filters, { scents: [], page: 1 })
            : undefined
        }
      >
        <ul>
          {scentFamilies.map((scent) => (
            <li key={scent}>
              <label className={checkRowClass}>
                <input
                  type="checkbox"
                  name="scent"
                  value={scent}
                  defaultChecked={filters.scents.includes(scent)}
                  className="h-4 w-4 accent-ink"
                />
                {getScentName(scent)}
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup
        title="Brand"
        defaultOpen
        clearHref={
          filters.brands.length > 0
            ? buildShopHref(filters, { brands: [], page: 1 })
            : undefined
        }
      >
        {brandOptions.length === 0 ? (
          <p className="text-sm text-ink/70">No brands yet.</p>
        ) : (
          <ul className="max-h-64 overflow-y-auto pr-1">
            {brandOptions.map((brand) => (
              <li key={brand.slug}>
                <label className={checkRowClass}>
                  <input
                    type="checkbox"
                    name="brand"
                    value={brand.slug}
                    defaultChecked={filters.brands.includes(brand.slug)}
                    className="h-4 w-4 accent-ink"
                  />
                  {brand.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </FilterGroup>

      <FilterGroup
        title="Price"
        defaultOpen={filters.minPrice !== null || filters.maxPrice !== null}
      >
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label htmlFor="min" className="block text-xs text-ink/70">
              From (₦)
            </label>
            <input
              id="min"
              name="min"
              type="number"
              min="0"
              step="1000"
              inputMode="numeric"
              defaultValue={filters.minPrice ?? ""}
              className={priceInputClass}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="max" className="block text-xs text-ink/70">
              To (₦)
            </label>
            <input
              id="max"
              name="max"
              type="number"
              min="0"
              step="1000"
              inputMode="numeric"
              defaultValue={filters.maxPrice ?? ""}
              className={priceInputClass}
            />
          </div>
        </div>
      </FilterGroup>

      <FilterGroup title="Availability" defaultOpen={filters.onlyAvailable}>
        <label className={checkRowClass}>
          <input
            type="checkbox"
            name="available"
            value="1"
            defaultChecked={filters.onlyAvailable}
            className="h-4 w-4 accent-ink"
          />
          Available now only
        </label>
      </FilterGroup>

      <div className="flex items-center gap-5 pt-1">
        <button
          type="submit"
          className="h-11 bg-ink px-8 text-xs uppercase tracking-[0.2em] text-cream hover:bg-accent"
        >
          Apply
        </button>
        <Link
          href="/shop"
          className="text-xs uppercase tracking-[0.2em] underline underline-offset-4"
        >
          Clear all
        </Link>
      </div>
    </form>
  );
}
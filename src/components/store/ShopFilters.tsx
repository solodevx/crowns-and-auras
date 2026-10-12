import Link from "next/link";
import { scentFamilies } from "@/config/scents";
import type { ProductFilters } from "@/lib/filter-products";

type ShopFiltersProps = { brands: string[]; filters: ProductFilters };

export default function ShopFilters({ brands, filters }: ShopFiltersProps) {
  return (
    <form method="get" action="/shop" className="space-y-6">
      <div>
        <label htmlFor="q" className="block text-sm font-medium">
          Search
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Brand or perfume name"
          className="mt-1 h-11 w-full rounded border border-ink/20 bg-white px-3"
        />
      </div>

      <div>
        <label htmlFor="brand" className="block text-sm font-medium">
          Brand
        </label>
        <select
          id="brand"
          name="brand"
          defaultValue={filters.brand}
          className="mt-1 h-11 w-full rounded border border-ink/20 bg-white px-3"
        >
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Scent</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {scentFamilies.map((scent) => (
            <label
              key={scent}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/20 px-4 text-sm has-checked:border-ink has-checked:bg-ink has-checked:text-cream"
            >
              <input
                type="checkbox"
                name="scent"
                value={scent}
                defaultChecked={filters.scents.includes(scent)}
              />
              {scent}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="h-11 rounded bg-ink px-6 text-sm text-cream"
        >
          Apply
        </button>
        <Link href="/shop" className="text-sm underline">
          Clear
        </Link>
      </div>
    </form>
  );
}
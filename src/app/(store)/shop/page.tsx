import { Suspense } from "react";
import Link from "next/link";
import ActiveFilters from "@/components/store/ActiveFilters";
import Pagination from "@/components/store/Pagination";
import ProductTile from "@/components/store/ProductTile";
import ShopFilterPanel from "@/components/store/ShopFilterPanel";
import ShopFilters from "@/components/store/ShopFilters";
import SortSelect from "@/components/store/SortSelect";
import {
  filterProducts,
  getBrandOptions,
  paginate,
  parseFilters,
  type SearchParams,
} from "@/lib/filter-products";
import { getProducts } from "@/lib/products";

export const metadata = {
  title: "Shop",
  description:
    "Browse designer and niche perfumes by scent, brand and price. Order online with delivery across Lagos.",
};

type ShopPageProps = { searchParams: Promise<SearchParams> };

export default function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <nav aria-label="Breadcrumb" className="text-xs text-ink/70">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Shop</li>
        </ol>
      </nav>

      <header className="mt-10 text-center">
        <h1 className="font-serif text-3xl uppercase tracking-[0.4em] md:text-4xl">
          Shop
        </h1>
        <span
          aria-hidden="true"
          className="mx-auto mt-4 block h-1.5 w-1.5 rounded-full bg-gold"
        />
        {/* PLACEHOLDER wording */}
        <p className="mx-auto mt-5 max-w-xl text-sm text-ink/70">
          Browse our perfumes by scent, brand and price. Order online and pay by
          bank transfer.
        </p>
      </header>

      <Suspense
        fallback={
          <p className="mt-12 text-center text-ink/70">Loading perfumes…</p>
        }
      >
        <ShopResults searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function ShopResults({ searchParams }: ShopPageProps) {
  const filters = parseFilters(await searchParams);
  const allProducts = await getProducts();
  const matches = filterProducts(allProducts, filters);
  const { items, page, totalPages } = paginate(matches, filters.page);

  const brandOptions = getBrandOptions(allProducts);
  const brandNames = new Map(
    brandOptions.map((brand) => [brand.slug, brand.name]),
  );

  const activeCount =
    (filters.q ? 1 : 0) +
    filters.brands.length +
    filters.scents.length +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.onlyAvailable ? 1 : 0);

  return (
    <div className="mt-12 grid gap-x-8 gap-y-6 lg:grid-cols-[16rem_1fr]">
      <p className="hidden text-xs uppercase tracking-[0.3em] lg:col-start-1 lg:row-start-1 lg:flex lg:items-center">
        Filter
      </p>

      <div className="lg:col-start-1 lg:row-start-2">
        <ShopFilterPanel activeCount={activeCount}>
          <ShopFilters brandOptions={brandOptions} filters={filters} />
        </ShopFilterPanel>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4 lg:col-start-2 lg:row-start-1">
        <p className="text-sm text-ink/70">
          {matches.length} {matches.length === 1 ? "perfume" : "perfumes"}
        </p>
        <SortSelect value={filters.sort} />
      </div>

      <div className="lg:col-start-2 lg:row-start-2">
        <ActiveFilters filters={filters} brandNames={brandNames} />

        {items.length === 0 ? (
          <p className="py-10">
            No perfumes match those filters.{" "}
            <Link href="/shop" className="underline">
              Clear filters
            </Link>
          </p>
        ) : (
          /* Thin lines between the tiles: each tile pulls itself over its neighbour's border */
          <ul className="grid grid-cols-2 pl-px pt-px md:grid-cols-3">
            {items.map((product) => (
              <li key={product.id} className="-ml-px -mt-px">
                <ProductTile product={product} showBrand />
              </li>
            ))}
          </ul>
        )}
        <Pagination filters={filters} page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
import { Suspense } from "react";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import ShopFilters from "@/components/store/ShopFilters";
import { placeholderProducts } from "@/data/placeholder-products";
import {
  filterProducts,
  getBrands,
  parseFilters,
  type SearchParams,
} from "@/lib/filter-products";

export const metadata = { title: "Shop" };

type ShopPageProps = { searchParams: Promise<SearchParams> };

export default function ShopPage({ searchParams }: ShopPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-3xl">Shop</h1>
      <Suspense fallback={<p className="mt-8 text-ink/60">Loading perfumes…</p>}>
        <ShopResults searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function ShopResults({ searchParams }: ShopPageProps) {
  // searchParams arrives as a Promise ("a value that's coming"), so we await it
  const filters = parseFilters(await searchParams);
  const products = filterProducts(placeholderProducts, filters);

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[16rem_1fr]">
      <aside>
        <ShopFilters brands={getBrands(placeholderProducts)} filters={filters} />
      </aside>

      <div>
        <p className="text-sm text-ink/60">
          {products.length} {products.length === 1 ? "perfume" : "perfumes"}
        </p>

        {products.length === 0 ? (
          <p className="mt-6">
            No perfumes match those filters.{" "}
            <Link href="/shop" className="underline">
              Clear filters
            </Link>
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
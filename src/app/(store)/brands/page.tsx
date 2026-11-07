import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import BrandCard from "@/components/store/BrandCard";
import { getActiveBrands } from "@/lib/brands";
import type { SearchParams } from "@/lib/filter-products";

export const metadata = {
  title: "Brands",
  description:
    "Browse all the perfume brands we sell. Order online with delivery across Lagos.",
};

type BrandsPageProps = { searchParams: Promise<SearchParams> };

export default function BrandsPage({ searchParams }: BrandsPageProps) {
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
          <li aria-current="page">Brands</li>
        </ol>
      </nav>

      <header className="mt-10 text-center">
        <h1 className="font-serif text-3xl uppercase tracking-[0.4em] md:text-4xl">
          Brands
        </h1>
        <span
          aria-hidden="true"
          className="mx-auto mt-4 block h-1.5 w-1.5 rounded-full bg-gold"
        />
        {/* PLACEHOLDER wording */}
        <p className="mx-auto mt-5 max-w-xl text-sm text-ink/70">
          Every perfume house we sell, in one place.
        </p>
      </header>

      <Suspense
        fallback={
          <p className="mt-12 text-center text-ink/70">Loading brands…</p>
        }
      >
        <BrandResults searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function BrandResults({ searchParams }: BrandsPageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (raw ?? "").trim().slice(0, 60);

  const allBrands = await getActiveBrands();
  const brands = query
    ? allBrands.filter((brand) =>
        brand.name.toLowerCase().includes(query.toLowerCase()),
      )
    : allBrands;

  return (
    <div className="mt-12">
      {/* The key rebuilds the box whenever the search changes, so it never goes stale */}
      <form
        key={query}
        method="get"
        action="/brands"
        className="mx-auto flex max-w-md gap-2"
      >
        <label htmlFor="brand-search" className="sr-only">
          Search brands
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/60"
            aria-hidden="true"
          />
          <input
            id="brand-search"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search brands"
            className="h-11 w-full border border-ink/15 bg-white/60 pl-9 pr-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="h-11 bg-ink px-6 text-xs uppercase tracking-[0.2em] text-cream hover:bg-accent"
        >
          Search
        </button>
      </form>

      {query && (
        <p className="mt-4 text-center text-sm text-ink/70">
          {brands.length} {brands.length === 1 ? "brand" : "brands"} for &ldquo;
          {query}&rdquo;.{" "}
          <Link href="/brands" className="underline underline-offset-4">
            Clear search
          </Link>
        </p>
      )}

      {allBrands.length === 0 ? (
        <p className="mt-12 text-center text-ink/70">
          Our brands are coming soon.
        </p>
      ) : brands.length === 0 ? (
        <p className="mt-12 text-center">
          No brands match that search.{" "}
          <Link href="/brands" className="underline underline-offset-4">
            See all brands
          </Link>
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4">
          {brands.map((brand) => (
            <li key={brand.id}>
              <BrandCard brand={brand} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
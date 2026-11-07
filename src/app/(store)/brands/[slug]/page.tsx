import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Check, SlidersHorizontal } from "lucide-react";
import BrandProductTile from "@/components/store/BrandProductTile";
import { getBrandBySlug, getBrandCurrentSlug } from "@/lib/brands";
import {
  DEFAULT_SORT,
  SORT_OPTIONS,
  filterProducts,
  parseFilters,
  type ProductFilters,
  type SearchParams,
  type SortValue,
} from "@/lib/filter-products";
import { isProductAvailable } from "@/lib/product";
import { getProducts } from "@/lib/products";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

// Perfumes shown at first, and added by each press of "Explore more"
const STEP = 12;
const MAX_SHOWN = 120;

type ViewState = { sort: SortValue; onlyAvailable: boolean; show: number };

function parseShow(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const number = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(number) || number < STEP) return STEP;
  return Math.min(Math.ceil(number / STEP) * STEP, MAX_SHOWN);
}

// Builds this page's address from the way it is currently viewed
function brandHref(slug: string, state: ViewState): string {
  const params = new URLSearchParams();
  if (state.sort !== DEFAULT_SORT) params.set("sort", state.sort);
  if (state.onlyAvailable) params.set("available", "1");
  if (state.show > STEP) params.set("show", String(state.show));
  const query = params.toString();
  return query ? `/brands/${slug}?${query}` : `/brands/${slug}`;
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    return { title: "Brand not found", robots: { index: false } };
  }

  const description = (
    brand.description ||
    `Shop ${brand.name} perfumes online. Delivery across Lagos.`
  ).slice(0, 160);

  return {
    title: `${brand.name} perfumes`,
    description,
    alternates: { canonical: `/brands/${brand.slug}` },
  };
}

export default function BrandPage({ params, searchParams }: BrandPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <Suspense fallback={<p className="text-ink/70">Loading brand…</p>}>
        <BrandDetails params={params} searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function BrandDetails({ params, searchParams }: BrandPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const brand = await getBrandBySlug(slug);

  if (!brand) {
    // An old address? Send the visitor to the brand's current address.
    const currentSlug = await getBrandCurrentSlug(slug);
    if (currentSlug && currentSlug !== slug) {
      permanentRedirect(`/brands/${currentSlug}`);
    }
    notFound();
  }

  // Only perfumes the public can see (the same rules as the shop)
  const all = (await getProducts()).filter(
    (product) => product.brandSlug === brand.slug,
  );
  const availableCount = all.filter(isProductAvailable).length;

  // Only the sort order and the availability switch apply on a brand page
  const parsed = parseFilters(query);
  const filters: ProductFilters = {
    ...parsed,
    q: "",
    brands: [],
    scents: [],
    minPrice: null,
    maxPrice: null,
    page: 1,
  };
  const state: ViewState = {
    sort: filters.sort,
    onlyAvailable: filters.onlyAvailable,
    show: parseShow(query.show),
  };

  const matches = filterProducts(all, filters);
  const shown = matches.slice(0, state.show);
  const active = state.onlyAvailable ? 1 : 0;

  return (
    <>
      {/* Breadcrumb on the left, Filters & Sort on the right */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3">
        <nav aria-label="Breadcrumb" className="text-xs text-ink/70">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href="/brands" className="hover:underline">
                Brands
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li aria-current="page">{brand.name}</li>
          </ol>
        </nav>

        {/* The key closes the panel after a choice is made */}
        <details
          key={`${state.sort}|${state.onlyAvailable}`}
          className="group relative"
        >
          <summary className="flex h-11 cursor-pointer list-none items-center gap-2 text-sm [&::-webkit-details-marker]:hidden">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters &amp; Sort{active > 0 ? ` (${active})` : ""}
          </summary>

          <div className="absolute right-0 top-full z-20 mt-1 w-64 border border-ink/15 bg-cream p-4 shadow-md">
            <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-ink/70">
              Sort by
            </p>
            <ul className="mt-2">
              {SORT_OPTIONS.map((option) => {
                const isCurrent = option.value === state.sort;
                return (
                  <li key={option.value}>
                    <Link
                      href={brandHref(brand.slug, {
                        ...state,
                        sort: option.value,
                        show: STEP,
                      })}
                      aria-current={isCurrent ? "true" : undefined}
                      className={`flex min-h-11 items-center justify-between text-sm hover:underline ${
                        isCurrent ? "font-medium" : ""
                      }`}
                    >
                      {option.label}
                      {isCurrent && (
                        <Check className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="mt-4 border-t border-ink/10 pt-4 text-[0.6875rem] uppercase tracking-[0.2em] text-ink/70">
              Availability
            </p>
            <Link
              href={brandHref(brand.slug, {
                ...state,
                onlyAvailable: !state.onlyAvailable,
                show: STEP,
              })}
              className="mt-2 flex min-h-11 items-center gap-3 text-sm hover:underline"
            >
              <span
                aria-hidden="true"
                className={`flex h-5 w-5 items-center justify-center border border-ink ${
                  state.onlyAvailable ? "bg-ink text-cream" : "bg-white"
                }`}
              >
                {state.onlyAvailable && <Check className="h-3.5 w-3.5" />}
              </span>
              Available now only
              <span className="sr-only">
                {state.onlyAvailable ? " (on)" : " (off)"}
              </span>
            </Link>
          </div>
        </details>
      </div>

      <header className="mt-8">
        <h1 className="font-serif text-3xl uppercase tracking-[0.2em] md:text-4xl">
          {brand.name}
        </h1>
        {brand.description && (
          <p className="mt-3 max-w-xl text-sm text-ink/80 md:text-base">
            {brand.description}
          </p>
        )}
        <p className="mt-3 text-sm text-ink/70">
          {all.length} {all.length === 1 ? "perfume" : "perfumes"}
          {availableCount < all.length && ` · ${availableCount} available now`}
        </p>
      </header>

      {all.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-2xl">
            No {brand.name} perfumes are available right now
          </p>
          <p className="mt-2 text-sm text-ink/70">
            Check back soon, or browse the rest of the shop.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-6">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center bg-ink px-8 text-xs uppercase tracking-[0.2em] text-cream hover:bg-accent"
            >
              Browse the shop
            </Link>
            <Link
              href="/brands"
              className="inline-flex h-12 items-center text-xs uppercase tracking-[0.15em] underline underline-offset-4"
            >
              All brands
            </Link>
          </div>
        </div>
      ) : matches.length === 0 ? (
        <p className="py-16 text-center">
          No perfumes match those filters.{" "}
          <Link
            href={`/brands/${brand.slug}`}
            className="underline underline-offset-4"
          >
            Clear filters
          </Link>
        </p>
      ) : (
        <>
          {/* Thin lines between the tiles: each tile pulls itself over its neighbour's border */}
          <ul className="mt-8 grid grid-cols-2 pl-px pt-px md:grid-cols-3 lg:grid-cols-4">
            {shown.map((product) => (
              <li key={product.id} className="-ml-px -mt-px">
                <BrandProductTile product={product} />
              </li>
            ))}
          </ul>

          <div className="mt-10 text-center">
            <p className="text-sm">
              Showing {shown.length} of {matches.length}
            </p>
            {shown.length < matches.length && (
              <Link
                href={brandHref(brand.slug, {
                  ...state,
                  show: state.show + STEP,
                })}
                scroll={false}
                className="mt-4 inline-flex h-12 items-center border border-ink px-8 text-xs uppercase tracking-[0.2em] hover:bg-ink hover:text-cream"
              >
                Explore more
              </Link>
            )}
          </div>
        </>
      )}
    </>
  );
}
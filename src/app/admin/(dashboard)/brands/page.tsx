import { Suspense } from "react";
import Link from "next/link";
import BrandToggleButton from "@/components/admin/BrandToggleButton";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminBrands } from "@/lib/admin-brands";
import { HOMEPAGE_BRAND_LIMIT } from "@/lib/brand-rules";
import type { SearchParams } from "@/lib/filter-products";
import { optimizedImageUrl } from "@/lib/image-url";

export const metadata = { title: "Brands" };

const savedMessages = {
  created: "Brand created.",
  updated: "Brand saved.",
  deleted: "Brand deleted.",
} as const;

type BrandsPageProps = { searchParams: Promise<SearchParams> };

export default function AdminBrandsPage({ searchParams }: BrandsPageProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">Brands</h1>
        <Link
          href="/admin/brands/new"
          className="inline-flex h-11 items-center rounded bg-ink px-5 text-sm text-cream"
        >
          Add brand
        </Link>
      </div>
      <Suspense fallback={<p className="mt-6 text-ink/70">Loading brands…</p>}>
        <BrandsContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function BrandsContent({ searchParams }: BrandsPageProps) {
  await requireAdmin();
  const saved = (await searchParams).saved;
  const savedKey = Array.isArray(saved) ? saved[0] : saved;
  const savedMessage =
    savedKey && savedKey in savedMessages
      ? savedMessages[savedKey as keyof typeof savedMessages]
      : "";

  const brands = await getAdminBrands();
  const shownOnHomepage = brands.filter(
    (brand) => brand.isActive && brand.isFeatured,
  ).length;
  const homepageFull = shownOnHomepage >= HOMEPAGE_BRAND_LIMIT;
  const fullHint = `Homepage full (${HOMEPAGE_BRAND_LIMIT})`;

  return (
    <>
      {savedMessage && (
        <p
          role="status"
          className="mt-6 rounded border border-green-700/30 bg-green-100 px-4 py-3 text-sm text-green-900"
        >
          {savedMessage}
        </p>
      )}

      <p className="mt-6 text-sm text-ink/80">
        Homepage brands: {shownOnHomepage} of {HOMEPAGE_BRAND_LIMIT}
        {homepageFull && " (full: unfeature one to feature another)"}
      </p>

      {shownOnHomepage > HOMEPAGE_BRAND_LIMIT && (
        <p className="mt-3 rounded border border-amber-700/30 bg-amber-100 px-4 py-3 text-sm text-amber-900">
          {shownOnHomepage} brands are featured, but the homepage shows only the
          first {HOMEPAGE_BRAND_LIMIT} (by display order). Unfeature{" "}
          {shownOnHomepage - HOMEPAGE_BRAND_LIMIT} of them.
        </p>
      )}

      {brands.length === 0 ? (
        <p className="mt-8 text-ink/70">No brands yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-ink/10 rounded-lg border border-ink/10">
          {brands.map((brand) => (
            <li
              key={brand.id}
              className={`flex flex-wrap items-center justify-between gap-3 p-4 ${
                brand.isActive ? "" : "bg-ink/5 text-ink/70"
              }`}
            >
              <div className="flex items-center gap-3">
                {brand.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={optimizedImageUrl(brand.imageUrl, 96, 96)}
                    alt={`${brand.name} logo`}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded bg-lavender/50 font-serif text-lg"
                  >
                    {brand.name.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="font-serif text-lg">{brand.name}</p>
                  <p className="text-xs">
                    /brands/{brand.slug} · {brand.productCount} product
                    {brand.productCount === 1 ? "" : "s"} · order{" "}
                    {brand.displayOrder}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2 text-xs">
                  <span
                    className={`rounded px-2 py-1 ${
                      brand.isActive
                        ? "bg-green-100 text-green-900"
                        : "bg-ink/10"
                    }`}
                  >
                    {brand.isActive ? "Active" : "Inactive"}
                  </span>
                  {brand.isFeatured && (
                    <span className="rounded bg-gold/40 px-2 py-1">
                      Featured
                    </span>
                  )}
                </div>
                <Link
                  href={`/admin/brands/${brand.id}`}
                  className="inline-flex h-11 items-center text-sm underline"
                >
                  Edit
                </Link>
                <BrandToggleButton
                  brandId={brand.id}
                  field="isFeatured"
                  nextValue={!brand.isFeatured}
                  label={brand.isFeatured ? "Unfeature" : "Feature"}
                  describedBy={brand.name}
                  disabled={!brand.isFeatured && brand.isActive && homepageFull}
                  hint={fullHint}
                />
                <BrandToggleButton
                  brandId={brand.id}
                  field="isActive"
                  nextValue={!brand.isActive}
                  label={brand.isActive ? "Deactivate" : "Activate"}
                  describedBy={brand.name}
                  disabled={!brand.isActive && brand.isFeatured && homepageFull}
                  hint={fullHint}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
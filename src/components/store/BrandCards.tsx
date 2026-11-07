import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HOMEPAGE_BRANDS_SHOWN } from "@/config/homepage";
import { getRandomFeaturedBrands } from "@/lib/random-featured";
import BrandCard from "./BrandCard";
import SectionHeading from "./SectionHeading";

// The home page section: a few of the brands the owner has featured, picked
// at random on every visit.
export default async function BrandCards() {
  const brands = await getRandomFeaturedBrands(HOMEPAGE_BRANDS_SHOWN);

  // No featured brands: no section, no gap
  if (brands.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 pt-4">
      <SectionHeading title="Shop by brand" />
      {/* Centres the cards when there are fewer than four */}
      <ul className="mt-8 flex flex-wrap justify-center gap-3 md:gap-4">
        {brands.map((brand) => (
          <li
            key={brand.id}
            className="basis-[calc(50%-0.375rem)] md:basis-[calc((100%-3rem)/4)]"
          >
            <BrandCard brand={brand} />
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center">
        <Link
          href="/brands"
          className="inline-flex h-11 items-center gap-1 text-xs uppercase tracking-[0.2em] underline-offset-4 hover:underline"
        >
          View all brands
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </p>
    </section>
  );
}
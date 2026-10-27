import Link from "next/link";
import { scentCategories, scentFamilies } from "@/config/scents";
import SectionHeading from "./SectionHeading";

export default function CollectionCards() {
  return (
    <section id="scents" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14">
      <SectionHeading title="Shop by scent" />
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {scentFamilies.map((slug) => {
          const category = scentCategories[slug];
          const textClass =
            category.text === "light" ? "text-cream" : "text-ink";

          return (
            <li key={slug}>
              <Link
                href={`/shop?scent=${slug}`}
                aria-label={`Shop ${category.name}. ${category.tagline}`}
                className={`relative flex min-h-44 flex-col justify-between overflow-hidden rounded-sm p-4 sm:min-h-56 sm:p-5 ${textClass}`}
                style={{
                  backgroundColor: category.color,
                  backgroundImage: `url(${category.photo})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Keeps the name readable on top of any photo */}
                <span
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(to right, color-mix(in srgb, ${category.color} 92%, transparent) 0%, color-mix(in srgb, ${category.color} 60%, transparent) 55%, transparent 100%)`,
                  }}
                />
                <span className="relative">
                  <span className="block font-serif text-base uppercase tracking-wider sm:text-xl">
                    {category.name}
                  </span>
                  <span className="mt-1 block text-[11px] sm:text-xs">
                    {category.tagline}
                  </span>
                </span>
                <span className="relative mt-4 inline-flex h-9 w-fit items-center border border-current px-3 text-[11px] uppercase tracking-[0.2em] sm:px-4">
                  Shop now
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
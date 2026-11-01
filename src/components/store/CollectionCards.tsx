import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  scentCategories,
  scentFamilies,
  type CardTone,
} from "@/config/scents";
import SectionHeading from "./SectionHeading";

// Each tone uses only the brand palette (the variables in globals.css).
const tones: Record<CardTone, { base: string; glow: string; text: string }> = {
  plum: {
    base: "var(--color-ink)",
    glow: "var(--color-gold)",
    text: "text-cream",
  },
  lavender: {
    base: "var(--color-lavender)",
    glow: "var(--color-cream)",
    text: "text-ink",
  },
  gold: {
    base: "var(--color-gold)",
    glow: "var(--color-cream)",
    text: "text-ink",
  },
};

// The picture fades into the card colour: the left fifth stays pure colour
const photoFade =
  "linear-gradient(to right, transparent 0%, transparent 15%, black 55%)";

export default function CollectionCards() {
  return (
    <section id="scents" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14">
      <SectionHeading title="Shop by scent" />
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {scentFamilies.map((slug) => {
          const category = scentCategories[slug];
          const tone = tones[category.tone];

          return (
            <li key={slug}>
              <Link
                href={`/shop?scent=${slug}`}
                aria-label={`Shop ${category.name}. ${category.tagline}`}
                className={`group relative isolate flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-sm p-3 sm:aspect-[3/2] sm:p-4 lg:p-5 ${tone.text}`}
                style={{ backgroundColor: tone.base }}
              >
                {/* The picture covers the card and fades into the card colour */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category.photo}
                  alt=""
                  width={1200}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 -z-10 h-full w-full object-cover object-[85%_center] transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  style={{ maskImage: photoFade, WebkitMaskImage: photoFade }}
                />
                {/* The soft glow */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen"
                  style={{
                    backgroundImage: `radial-gradient(ellipse at 78% 45%, color-mix(in srgb, ${tone.glow} 45%, transparent) 0%, transparent 62%)`,
                  }}
                />

                {/* The text stays in the left half so the picture has room */}
                <span className="relative w-[60%] sm:w-1/2">
                  <span className="block break-words font-serif text-xs uppercase leading-snug tracking-wider sm:text-sm lg:text-base">
                    {category.name}
                  </span>
                  <span className="mt-1 block text-[10px] leading-snug sm:text-[11px]">
                    {category.tagline}
                  </span>
                </span>

                {/* A quiet text link: thin underline, arrow on the end */}
                <span className="relative inline-flex w-fit items-center gap-1.5 border-b border-current pb-0.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-[border-width] duration-300 group-hover:border-b-2 motion-reduce:transition-none">
                  Shop now
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
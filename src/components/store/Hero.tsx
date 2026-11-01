import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getScentName } from "@/config/scents";
import { siteConfig } from "@/config/site";
import { getFeaturedProducts } from "@/lib/products";

// PLACEHOLDER copy
const facts = [
  "Browse by scent",
  "Pay by bank transfer",
  "Delivery across Lagos",
];

// The vertical list on the right: the first featured perfume's scent families.
async function HeroNotes() {
  const [product] = await getFeaturedProducts();
  if (!product || product.scentFamilies.length === 0) return null;

  return (
    <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 md:block">
      <ol className="relative space-y-8 border-l border-cream/50 pl-7">
        {product.scentFamilies.slice(0, 3).map((family) => (
          <li key={family} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-9.25 top-0.5 h-4 w-4 rounded-full border border-cream bg-ink"
            />
            <p className="text-[10px] uppercase tracking-[0.25em] text-cream/80">
              Scent
            </p>
            <p className="text-sm">{getScentName(family)}</p>
          </li>
        ))}
      </ol>
      <Link
        href={`/shop/${product.slug}`}
        className="mt-8 inline-flex h-11 items-center gap-2 text-xs uppercase tracking-[0.2em] underline-offset-4 hover:underline"
      >
        {product.name}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      className="relative flex min-h-[max(34rem,75svh)] w-full overflow-hidden text-cream"
      style={{
        // Drop your photo at public/hero.jpg. Until then the gradient shows.
        backgroundImage:
          "url(/images/Hero.jpg), linear-gradient(160deg, color-mix(in srgb, var(--color-ink) 80%, black) 0%, var(--color-ink) 55%, color-mix(in srgb, var(--color-ink) 55%, var(--color-gold)) 130%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Keeps the text readable whatever the photo looks like */}
      <div aria-hidden="true" className="absolute inset-0 bg-ink/20" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink/55 md:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-linear-to-r from-ink/90 via-ink/55 to-ink/5 md:block"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col justify-between gap-12 px-4 py-12 md:py-16">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em]">Perfumes</p>
          <h1 className="mt-6 max-w-xl font-serif text-5xl font-normal leading-[1.05] md:text-7xl">
            Find a scent that feels like you.
          </h1>
          <p className="mt-4 font-serif text-xl md:text-2xl">
            Fragrances for <em>every</em> mood.
          </p>
          <p className="mt-6 max-w-sm text-sm text-cream/90">
            {siteConfig.description}
          </p>
          <Link
            href="/shop"
            className="mt-10 flex h-11 w-64 items-center justify-between border-b border-cream text-xs uppercase tracking-[0.25em] hover:text-gold"
          >
            Discover the scent
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="flex flex-wrap gap-y-3 text-[11px] uppercase tracking-widest">
          {facts.map((fact, index) => (
            <li
              key={fact}
              className={index === 0 ? "pr-4" : "border-l border-cream/40 px-4"}
            >
              {fact}
            </li>
          ))}
        </ul>

        <Suspense fallback={null}>
          <HeroNotes />
        </Suspense>
      </div>
    </section>
  );
}
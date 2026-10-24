import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { getFeaturedProducts } from "@/lib/products";

// PLACEHOLDER copy
const facts = [
  "Browse by scent",
  "Pay by bank transfer",
  "Delivery across Lagos",
];

// The vertical list on the photo: the first featured perfume's scent families.
async function HeroNotes() {
  const [product] = await getFeaturedProducts();
  if (!product || product.scentFamilies.length === 0) return null;

  return (
    <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 text-cream md:block lg:right-12">
      <ol className="relative space-y-8 border-l border-cream/40 pl-7">
        {product.scentFamilies.slice(0, 3).map((family) => (
          <li key={family} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-9.25 top-0.5 h-4 w-4 rounded-full border border-cream bg-ink"
            />
            <p className="text-[10px] uppercase tracking-[0.25em] text-cream/75">
              Scent
            </p>
            <p className="text-sm">{family}</p>
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
    <section className="mx-auto max-w-6xl px-3 pt-3 md:px-4">
      <div className="grid overflow-hidden border border-gold/50 md:grid-cols-[1.05fr_1fr]">
        <div className="flex flex-col justify-between gap-12 bg-cream p-6 md:min-h-160 md:p-12">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em]">Perfumes</p>
            <h1 className="mt-6 font-serif text-5xl font-normal leading-[1.05] md:text-7xl">
              Find a scent that feels like you.
            </h1>
            <p className="mt-4 font-serif text-xl md:text-2xl">
              Fragrances for <em>every</em> mood.
            </p>
            <p className="mt-6 max-w-sm text-sm text-ink/80">
              {siteConfig.description}
            </p>
            <Link
              href="/shop"
              className="mt-10 flex h-11 w-64 items-center justify-between border-b border-ink text-xs uppercase tracking-[0.25em] hover:text-accent"
            >
              Discover the scent
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <ul className="flex flex-wrap gap-y-3 text-[11px] uppercase tracking-widest">
            {facts.map((fact, index) => (
              <li
                key={fact}
                className={index === 0 ? "pr-4" : "border-l border-ink/30 px-4"}
              >
                {fact}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative min-h-72 md:min-h-0"
          style={{
            // Drop your photo at public/hero.jpg. Until then the gradient shows.
            backgroundImage:
              "url(/hero.jpg), linear-gradient(160deg, color-mix(in srgb, var(--color-ink) 80%, black) 0%, var(--color-ink) 55%, color-mix(in srgb, var(--color-ink) 55%, var(--color-gold)) 130%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div aria-hidden="true" className="absolute inset-0 bg-ink/25" />
          <Suspense fallback={null}>
            <HeroNotes />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
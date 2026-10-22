import { Suspense } from "react";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import { scentFamilies } from "@/config/scents";
import { siteConfig } from "@/config/site";
import { getFeaturedProducts } from "@/lib/products";

// PLACEHOLDER COPY: replace with the client's real wording.
const steps = [
  { title: "Choose your scent", text: "Browse by brand or scent family." },
  { title: "Order and pay", text: "Pay by bank transfer and send us the proof." },
  { title: "We deliver", text: "Delivery across Lagos." },
];

async function FeaturedProducts() {
  const featuredProducts = await getFeaturedProducts();

  if (featuredProducts.length === 0) {
    return <p className="mt-6 text-ink/70">New perfumes coming soon.</p>;
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
      {featuredProducts.map((product) => (
        <ProductCard key={product.id} product={product} headingLevel="h3" />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <h1 className="max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
          Find a scent that feels like you.
        </h1>
        <p className="mt-4 max-w-xl text-ink/70">{siteConfig.description}</p>
        <Link
          href="/shop"
          className="mt-8 inline-flex h-12 items-center rounded bg-ink px-8 text-sm text-cream"
        >
          Shop perfumes
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-serif text-2xl">Shop by scent</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {scentFamilies.map((scent) => (
            <li key={scent}>
              <Link
                href={`/shop?scent=${scent}`}
                className="inline-flex h-11 items-center rounded-full border border-ink/20 px-5 text-sm hover:border-ink"
              >
                {scent}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-2xl">Featured</h2>
          <Link href="/shop" className="text-sm underline">
            View all
          </Link>
        </div>
        <Suspense fallback={<p className="mt-6 text-ink/70">Loading…</p>}>
          <FeaturedProducts />
        </Suspense>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-serif text-2xl">How it works</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <p className="font-serif text-3xl text-accent">{index + 1}</p>
              <p className="mt-2 font-medium">{step.title}</p>
              <p className="text-sm text-ink/70">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

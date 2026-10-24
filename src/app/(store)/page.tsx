import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CollectionCards from "@/components/store/CollectionCards";
import FeaturedProductCard from "@/components/store/FeaturedProductCard";
import Hero from "@/components/store/Hero";
import SectionHeading from "@/components/store/SectionHeading";
import { siteConfig } from "@/config/site";
import { getFeaturedProducts } from "@/lib/products";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// PLACEHOLDER COPY: replace with the client's real wording before launch.
const steps = [
  { title: "Choose your scent", text: "Browse by brand or scent family." },
  {
    title: "Order and pay",
    text: "Pay by bank transfer and send us the proof.",
  },
  { title: "We deliver", text: "Delivery across Lagos." },
];

async function FeaturedProducts() {
  const featured = (await getFeaturedProducts()).slice(0, 5);

  if (featured.length === 0) {
    return (
      <p className="mt-8 text-center text-ink/70">New perfumes coming soon.</p>
    );
  }

  return (
    <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {featured.map((product) => (
        <li key={product.id}>
          <FeaturedProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  const whatsappLink = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    "Hello, I have a question about your perfumes.",
  );

  return (
    <>
      <Hero />

      <CollectionCards />

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-4">
        <SectionHeading title="Featured fragrances" />
        <Suspense
          fallback={<p className="mt-8 text-center text-ink/70">Loading…</p>}
        >
          <FeaturedProducts />
        </Suspense>
        <p className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex h-11 items-center gap-1 text-xs uppercase tracking-[0.2em] underline-offset-4 hover:underline"
          >
            View all fragrances
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </p>
      </section>

      <section className="mt-10 bg-blush">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <SectionHeading title="How it works" />
          <ol className="mt-8 grid gap-8 text-center md:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <p className="font-serif text-4xl">{index + 1}</p>
                <p className="mt-2 font-medium">{step.title}</p>
                <p className="text-sm text-ink/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ink text-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-12">
          <div>
            <h2 className="font-serif text-2xl">Not sure which scent?</h2>
            <p className="mt-1 text-sm text-cream/80">
              Send us a message and we will help you choose.
            </p>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center border border-cream px-8 text-xs uppercase tracking-[0.2em] hover:bg-cream hover:text-ink"
          >
            Chat on WhatsApp (opens WhatsApp)
          </a>
        </div>
      </section>
    </>
  );
}
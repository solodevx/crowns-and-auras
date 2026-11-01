import Link from "next/link";

// PLACEHOLDER wording, written from what we know. Your sister replaces it.
export default function AboutBanner() {
  return (
    <section
      id="about"
      className="relative isolate scroll-mt-24 overflow-hidden bg-blush"
      style={{
        // Drop your picture at public/images/about.jpg
        backgroundImage: "url(/images/about.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-blush/85 md:hidden"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-linear-to-r from-blush via-blush/80 to-transparent md:block"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="max-w-md">
          <p className="flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.3em]">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            About us
          </p>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            Luxury you can wear every day.
          </h2>
          <p className="mt-4 text-sm text-ink/80 md:text-base">
            We bring well-loved fragrances from the brands you know to your door
            in Lagos. Browse by scent, choose your size and order in a few taps.
            Pay by bank transfer, and we take care of the rest.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-12 items-center bg-ink px-8 text-xs uppercase tracking-[0.2em] text-cream hover:bg-accent"
          >
            Shop perfumes
          </Link>
        </div>
      </div>
    </section>
  );
}
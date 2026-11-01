import Link from "next/link";
import { Flower2, Landmark, MessageCircle, Truck } from "lucide-react";
import { siteConfig } from "@/config/site";

// Tune the purple here.
const PURPLE_LEFT = 92; // how dark it is at the far left (0 to 100)
const PURPLE_MIDDLE = 55; // how dark it is about a third of the way across
const PURPLE_REACH = 60; // how far across it reaches, in % of the width. The rest is your picture

// Only things that are true of the shop today
const trustPoints = [
  { icon: Flower2, label: "Browse by scent" },
  { icon: Landmark, label: "Pay by bank transfer" },
  { icon: Truck, label: "Delivery across Lagos" },
  { icon: MessageCircle, label: "Help on WhatsApp" },
];

export default function Hero() {
  return (
    <section
      className="relative isolate flex min-h-[max(32rem,75svh)] w-full overflow-hidden text-cream"
      style={{
        // Drop your picture at public/images/hero.jpg. Until then the purple gradient shows.
        backgroundImage:
          "url(/images/hero.jpg), linear-gradient(115deg, color-mix(in srgb, var(--color-ink) 82%, black) 0%, var(--color-ink) 45%, color-mix(in srgb, var(--color-accent) 70%, var(--color-gold)) 135%)",
        backgroundSize: "cover",
        backgroundPosition: "center right",
      }}
    >
      {/* Phones: an even purple so the text stays readable */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-ink/65 md:hidden"
      />
      {/* Larger screens: dark purple on the left that flows away to the right */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage: `linear-gradient(to right, color-mix(in srgb, var(--color-ink) ${PURPLE_LEFT}%, transparent) 0%, color-mix(in srgb, var(--color-ink) ${PURPLE_MIDDLE}%, transparent) ${Math.round(PURPLE_REACH * 0.55)}%, transparent ${PURPLE_REACH}%)`,
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl items-center px-4 py-14">
        <div className="max-w-xl">
          <p className="flex items-center gap-3 text-[0.6875rem] uppercase tracking-[0.3em]">
            <span aria-hidden="true" className="h-px w-8 bg-gold" />
            Perfumes
          </p>
          <h1 className="mt-5 font-serif text-5xl font-normal leading-[1.05] md:text-7xl lg:text-[5.25rem]">
            Find a scent that <em>feels like you.</em>
          </h1>
          <p className="mt-5 max-w-md text-sm text-cream/90 md:text-base">
            {siteConfig.description}
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex h-12 items-center bg-gold px-8 text-xs font-medium uppercase tracking-[0.2em] text-ink transition hover:brightness-110"
          >
            Discover the collection
          </Link>

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:flex-wrap sm:gap-x-8">
            {trustPoints.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5">
                <Icon
                  className="h-6 w-6 shrink-0"
                  strokeWidth={1.25}
                  aria-hidden="true"
                />
                <span className="max-w-28 text-[0.625rem] uppercase leading-tight tracking-widest">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
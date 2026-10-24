import Link from "next/link";
import type { ScentFamily } from "@/config/scents";
import SectionHeading from "./SectionHeading";

type Collection = {
  scent: ScentFamily;
  title: string;
  tagline: string;
  image: string;
  className: string;
  overlay: string;
};

// PLACEHOLDER wording. Photos go in public/collections/ with these file names.
const collections: Collection[] = [
  {
    scent: "Floral",
    title: "Floral Bouquets",
    tagline: "Soft. Romantic. Timeless.",
    image: "/collections/floral.jpg",
    className: "bg-ink text-cream",
    overlay: "from-ink/85 via-ink/45",
  },
  {
    scent: "Oriental",
    title: "Warm & Sensual",
    tagline: "Rich. Alluring. Addictive.",
    image: "/collections/warm.jpg",
    className: "bg-lavender text-ink",
    overlay: "from-lavender/90 via-lavender/50",
  },
  {
    scent: "Fresh",
    title: "Fresh & Radiant",
    tagline: "Light. Elegant. Uplifting.",
    image: "/collections/fresh.jpg",
    className: "bg-ink text-cream",
    overlay: "from-ink/85 via-ink/45",
  },
  {
    scent: "Woody",
    title: "Woody & Deep",
    tagline: "Calm. Grounded. Lasting.",
    image: "/collections/woody.jpg",
    className: "bg-gold text-ink",
    overlay: "from-gold/90 via-gold/50",
  },
];

export default function CollectionCards() {
  return (
    <section id="scents" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14">
      <SectionHeading title="Shop by collection" />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((collection) => (
          <li key={collection.scent}>
            <Link
              href={`/shop?scent=${collection.scent}`}
              className={`relative flex min-h-52 flex-col justify-between overflow-hidden rounded-sm p-5 ${collection.className}`}
              style={{
                backgroundImage: `url(${collection.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center right",
              }}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-0 bg-linear-to-r ${collection.overlay} to-transparent`}
              />
              <span className="relative">
                <span className="block font-serif text-xl uppercase tracking-wider">
                  {collection.title}
                </span>
                <span className="mt-1 block text-xs">{collection.tagline}</span>
              </span>
              <span className="relative mt-6 inline-flex h-9 w-fit items-center border border-current px-4 text-[11px] uppercase tracking-[0.2em]">
                Shop now
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
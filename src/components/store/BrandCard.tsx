import Link from "next/link";
import type { PublicBrand } from "@/lib/brands";
import { optimizedImageUrl } from "@/lib/image-url";

// "contain" fits a whole logo inside the tile. Change it to "cover" if you
// upload photos instead of logos, so the picture fills the tile.
const IMAGE_FIT: "contain" | "cover" = "contain";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

export default function BrandCard({ brand }: { brand: PublicBrand }) {
  // Only trust pictures from our own image library
  const image = brand.imageUrl.startsWith("https://res.cloudinary.com/")
    ? brand.imageUrl
    : "";

  return (
    <Link href={`/brands/${brand.slug}`} className="group block text-center">
      <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden border border-ink/15 bg-white transition-colors group-hover:border-gold">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={optimizedImageUrl(image, 480, 360)}
            alt={`${brand.name} brand image`}
            width={480}
            height={360}
            loading="lazy"
            className={
              IMAGE_FIT === "contain"
                ? "h-full w-full object-contain p-6"
                : "h-full w-full object-cover"
            }
          />
        ) : (
          <span
            aria-hidden="true"
            className="font-serif text-4xl tracking-wider text-ink/30"
          >
            {initials(brand.name)}
          </span>
        )}
      </div>
      <p className="mt-3 font-serif text-sm uppercase tracking-[0.15em] group-hover:underline group-hover:underline-offset-4">
        {brand.name}
      </p>
    </Link>
  );
}
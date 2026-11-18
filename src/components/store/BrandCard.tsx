import Link from "next/link";
import type { PublicBrand } from "@/lib/brands";
import { optimizedImageUrl } from "@/lib/image-url";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

// A portrait tile: the picture fills it edge to edge, the name sits below.
export default function BrandCard({ brand }: { brand: PublicBrand }) {
  // Only trust pictures from our own image library
  const image = brand.imageUrl.startsWith("https://res.cloudinary.com/")
    ? brand.imageUrl
    : "";

  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="group flex h-full flex-col border border-ink/10 bg-[color-mix(in_srgb,var(--color-blush)_55%,var(--color-cream))] text-center transition-colors hover:bg-blush"
    >
      <div className="relative aspect-3/4 w-full overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={optimizedImageUrl(image, 600, 800)}
            alt={`${brand.name} brand image`}
            width={600}
            height={800}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-serif text-4xl tracking-wider text-ink/30"
          >
            {initials(brand.name)}
          </span>
        )}
      </div>
      <p className="px-3 py-4 font-serif text-xs uppercase tracking-[0.15em] group-hover:underline group-hover:underline-offset-4 sm:text-sm">
        {brand.name}
      </p>
    </Link>
  );
}
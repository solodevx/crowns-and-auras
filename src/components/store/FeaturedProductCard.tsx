import Link from "next/link";
import type { Product } from "@/types/product";
import { formatNaira } from "@/lib/format";
import { optimizedImageUrl } from "@/lib/image-url";
import { getStartingPrice, isProductAvailable } from "@/lib/product";

export default function FeaturedProductCard({ product }: { product: Product }) {
  const available = isProductAvailable(product);
  const [firstImage] = product.images; // undefined if there are no photos

  return (
    <article className="h-full">
      <Link
        href={`/shop/${product.slug}`}
        className="group flex h-full flex-col rounded-sm border border-ink/15 bg-white/60 p-4 text-center hover:border-gold"
      >
        <div className="relative aspect-3/4 overflow-hidden bg-white">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={optimizedImageUrl(firstImage, 360, 480)}
              srcSet={`${optimizedImageUrl(firstImage, 360, 480)} 360w, ${optimizedImageUrl(firstImage, 720, 960)} 720w`}
              sizes="(min-width: 1024px) 18vw, 45vw"
              alt={`${product.brand} ${product.name}`}
              width={360}
              height={480}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full items-center justify-center p-4 font-serif text-ink/40"
            >
              {product.brand}
            </div>
          )}
          {!available && (
            <span className="absolute left-2 top-2 bg-ink px-2 py-1 text-[11px] uppercase tracking-widest text-cream">
              Unavailable
            </span>
          )}
        </div>

        <h3 className="mt-4 font-serif text-sm uppercase tracking-[0.15em]">
          {product.name}
        </h3>
        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ink/70">
          {product.brand}
        </p>

        <div className="mt-auto pt-3">
          <p className="text-sm">
            From {formatNaira(getStartingPrice(product))}
          </p>
          <span className="mt-3 block bg-ink px-4 py-3 text-[11px] uppercase tracking-[0.2em] text-cream group-hover:bg-accent">
            Choose size
          </span>
        </div>
      </Link>
    </article>
  );
}
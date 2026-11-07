import Link from "next/link";
import type { Product } from "@/types/product";
import { formatNaira } from "@/lib/format";
import { optimizedImageUrl } from "@/lib/image-url";
import { getStartingPrice, isProductAvailable } from "@/lib/product";

// "contain" shows the whole bottle with space around it (best for white-background
// or cut-out photos). Change to "cover" for photos that fill the whole frame.
const PHOTO_FIT: "contain" | "cover" = "contain";

type ProductTileProps = {
  product: Product;
  // The shop mixes brands, so it shows the brand name. A brand page doesn't need to.
  showBrand?: boolean;
};

export default function ProductTile({
  product,
  showBrand = false,
}: ProductTileProps) {
  const available = isProductAvailable(product);
  const [firstImage] = product.images; // undefined if there are no photos

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex h-full flex-col border border-ink/10 bg-[color-mix(in_srgb,var(--color-blush)_55%,var(--color-cream))] p-4 text-center transition-colors hover:bg-blush"
    >
      <div className="relative aspect-3/4 w-full">
        {firstImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={optimizedImageUrl(firstImage, 480, 640)}
            srcSet={`${optimizedImageUrl(firstImage, 360, 480)} 360w, ${optimizedImageUrl(firstImage, 720, 960)} 720w`}
            sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
            alt={`${product.brand} ${product.name}`}
            width={480}
            height={640}
            loading="lazy"
            className={`absolute inset-0 h-full w-full transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
              PHOTO_FIT === "contain"
                ? "object-contain mix-blend-multiply"
                : "object-cover"
            }`}
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center px-2 font-serif text-2xl text-ink/30"
          >
            {product.brand}
          </span>
        )}
        {!available && (
          <span className="absolute left-0 top-0 border border-ink/15 bg-white px-2 py-1 text-[0.625rem] uppercase tracking-widest">
            Unavailable
          </span>
        )}
      </div>

      {showBrand && (
        <p className="mt-4 text-[0.6875rem] uppercase tracking-[0.15em] text-ink/70">
          {product.brand}
        </p>
      )}
      <h2
        className={`font-serif text-xs uppercase leading-snug tracking-[0.15em] sm:text-sm ${
          showBrand ? "mt-1" : "mt-4"
        }`}
      >
        {product.name}
      </h2>
      <p className="mt-2 text-xs text-ink/80">
        From {formatNaira(getStartingPrice(product))}
      </p>
    </Link>
  );
}
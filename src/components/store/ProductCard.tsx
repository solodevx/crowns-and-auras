import Link from "next/link";
import type { Product } from "@/types/product";
import { formatNaira } from "@/lib/format";
import { optimizedImageUrl } from "@/lib/image-url";
import { getStartingPrice, isProductAvailable } from "@/lib/product";

export default function ProductCard({ product }: { product: Product }) {
  const available = isProductAvailable(product);
  const [firstImage] = product.images; // undefined if there are no photos

  return (
    <article>
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-ink/5">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={optimizedImageUrl(firstImage, 400, 500)}
              srcSet={`${optimizedImageUrl(firstImage, 400, 500)} 400w, ${optimizedImageUrl(firstImage, 800, 1000)} 800w`}
              sizes="(min-width: 1024px) 25vw, 50vw"
              alt={`${product.brand} ${product.name}`}
              width={400}
              height={500}
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center font-serif text-ink/40">
              {product.brand}
            </div>
          )}
          {!available && (
            <span className="absolute left-2 top-2 rounded bg-ink px-2 py-1 text-xs text-cream">
              Unavailable
            </span>
          )}
        </div>

        <p className="mt-3 text-xs uppercase tracking-widest text-ink/60">
          {product.brand}
        </p>
        <h2 className="font-serif text-lg leading-snug">{product.name}</h2>
        <p className="mt-1 text-xs text-ink/60">
          {product.scentFamilies.join(" · ")}
        </p>
        <p className="mt-1 text-sm">
          From {formatNaira(getStartingPrice(product))}
        </p>
      </Link>
    </article>
  );
}
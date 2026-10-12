import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types/product";
import { formatNaira } from "@/lib/format";
import { getStartingPrice, isProductAvailable } from "@/lib/product";

export default function ProductCard({ product }: { product: Product }) {
  const available = isProductAvailable(product);
  const [firstImage] = product.images; // undefined if there are no images yet

  return (
    <article>
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-ink/5">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={`${product.brand} ${product.name}`}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition group-hover:scale-105"
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
        <p className="mt-1 text-sm">From {formatNaira(getStartingPrice(product))}</p>
      </Link>
    </article>
  );
}
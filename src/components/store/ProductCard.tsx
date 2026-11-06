import Link from "next/link";
import type { Product } from "@/types/product";
import { formatNaira } from "@/lib/format";
import { optimizedImageUrl } from "@/lib/image-url";
import { getStartingPrice, isProductAvailable } from "@/lib/product";

type ProductCardProps = {
  product: Product;
  headingLevel?: "h2" | "h3";
};

export default function ProductCard({
  product,
  headingLevel: Heading = "h2",
}: ProductCardProps) {
  const available = isProductAvailable(product);
  const [firstImage] = product.images; // undefined if there are no photos

  return (
    <article>
      <Link href={`/shop/${product.slug}`} className="group block">
        <div className="relative aspect-3/4 overflow-hidden border border-ink/15 bg-white">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={optimizedImageUrl(firstImage, 400, 533)}
              srcSet={`${optimizedImageUrl(firstImage, 400, 533)} 400w, ${optimizedImageUrl(firstImage, 800, 1066)} 800w`}
              sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 45vw"
              alt={`${product.brand} ${product.name}`}
              width={400}
              height={533}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full items-center justify-center p-4 text-center font-serif text-ink/40"
            >
              {product.brand}
            </div>
          )}
          {!available && (
            <span className="absolute left-3 top-3 border border-ink/15 bg-white px-3 py-1 text-[0.625rem] uppercase tracking-widest">
              Unavailable
            </span>
          )}
        </div>

        <p className="mt-3 text-[0.6875rem] uppercase tracking-[0.15em] text-ink/70">
          {product.brand}
        </p>
        <Heading className="font-serif text-lg leading-snug">
          {product.name}
        </Heading>
        <p className="mt-1 text-sm">
          From {formatNaira(getStartingPrice(product))}
        </p>
      </Link>
    </article>
  );
}
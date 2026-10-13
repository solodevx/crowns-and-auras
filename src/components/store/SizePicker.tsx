"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/types/product";
import { addToCart } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";

export default function SizePicker({ product }: { product: Product }) {
  const firstAvailable = product.variants.find((variant) => variant.available);

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    firstAvailable?.size,
  );
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = product.variants.find(
    (variant) => variant.size === selectedSize,
  );

  function handleAddToCart() {
    if (!selectedVariant || !selectedVariant.available) return;

    addToCart({
      productId: product.id,
      slug: product.slug,
      brand: product.brand,
      name: product.name,
      size: selectedVariant.size,
      unitPrice: selectedVariant.price,
    });
    setJustAdded(true);
  }

  return (
    <div className="mt-6">
      <p className="text-sm font-medium">Size</p>

      <div className="mt-2 flex flex-wrap gap-2">
        {product.variants.map((variant) => {
          const isSelected = variant.size === selectedSize;

          return (
            <button
              key={variant.size}
              type="button"
              disabled={!variant.available}
              onClick={() => {
                setSelectedSize(variant.size);
                setJustAdded(false);
              }}
              aria-pressed={isSelected}
              className={`h-11 rounded-full border px-5 text-sm ${
                isSelected ? "border-ink bg-ink text-cream" : "border-ink/20"
              } ${!variant.available ? "cursor-not-allowed line-through opacity-40" : ""}`}
            >
              {variant.size}
            </button>
          );
        })}
      </div>

      {selectedVariant ? (
        <p className="mt-4 text-2xl">{formatNaira(selectedVariant.price)}</p>
      ) : (
        <p className="mt-4 text-ink/70">Currently unavailable</p>
      )}

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!selectedVariant}
        className="mt-6 h-12 w-full rounded bg-ink px-8 text-sm text-cream disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Add to cart
      </button>

      <p role="status" className="mt-3 text-sm">
        {justAdded && (
          <>
            Added to cart.{" "}
            <Link href="/cart" className="underline">
              View cart
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
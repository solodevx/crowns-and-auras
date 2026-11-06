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
      image: product.images[0] ?? "",
    });
    setJustAdded(true);
  }

  return (
    <div className="mt-8">
      <p className="text-sm">
        <span className="font-medium">Size:</span>{" "}
        <span className="text-ink/70">
          {selectedVariant ? selectedVariant.size : "none available"}
        </span>
      </p>

      <div
        className="mt-3 flex flex-wrap gap-2"
        role="group"
        aria-label="Choose a size"
      >
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
              className={`h-11 min-w-20 border px-4 text-sm ${
                isSelected ? "border-ink ring-1 ring-ink" : "border-ink/25"
              } ${!variant.available ? "cursor-not-allowed line-through opacity-40" : "hover:border-ink"}`}
            >
              {variant.size}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <p className="text-2xl">
          {selectedVariant
            ? formatNaira(selectedVariant.price)
            : "Currently unavailable"}
        </p>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedVariant}
          className="h-12 min-w-48 flex-1 bg-ink px-8 text-xs uppercase tracking-[0.2em] text-cream hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
        >
          Add to cart
        </button>
      </div>

      <p role="status" className="mt-3 min-h-5 text-sm">
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
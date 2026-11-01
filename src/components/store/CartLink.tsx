"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCartCount, useCartItems } from "@/lib/cart-store";

export default function CartLink() {
  const count = getCartCount(useCartItems());

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} items`}
      className="relative inline-flex h-11 w-11 items-center justify-center hover:text-accent"
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.625rem] font-medium text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}
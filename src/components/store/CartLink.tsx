"use client";

import Link from "next/link";
import { getCartCount, useCartItems } from "@/lib/cart-store";

export default function CartLink() {
  const count = getCartCount(useCartItems());

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} items`}
      className="inline-flex h-11 items-center text-xs uppercase tracking-[0.2em] hover:text-accent"
    >
      Cart ({count})
    </Link>
  );
}
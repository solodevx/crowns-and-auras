"use client";

import Link from "next/link";
import {
  MAX_QUANTITY,
  getCartSubtotal,
  removeItem,
  updateQuantity,
  useCartItems,
} from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";

export default function CartView() {
  const items = useCartItems();

  if (items.length === 0) {
    return (
      <div className="mt-8">
        <p className="text-ink/70">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex h-11 items-center rounded bg-ink px-6 text-sm text-cream"
        >
          Browse perfumes
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 md:grid-cols-[1fr_20rem]">
      <ul className="divide-y divide-ink/10">
        {items.map((item) => (
          <li
            key={`${item.productId}-${item.size}`}
            className="flex flex-wrap items-center justify-between gap-4 py-4"
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-ink/60">
                {item.brand}
              </p>
              <Link href={`/shop/${item.slug}`} className="font-serif text-lg">
                {item.name}
              </Link>
              <p className="text-sm text-ink/70">
                {item.size} · {formatNaira(item.unitPrice)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full border border-ink/20">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.name} ${item.size}`}
                  disabled={item.quantity <= 1}
                  onClick={() =>
                    updateQuantity(item.productId, item.size, item.quantity - 1)
                  }
                  className="h-11 w-11 disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm" aria-live="polite">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.name} ${item.size}`}
                  disabled={item.quantity >= MAX_QUANTITY}
                  onClick={() =>
                    updateQuantity(item.productId, item.size, item.quantity + 1)
                  }
                  className="h-11 w-11 disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <p className="w-24 text-right">
                {formatNaira(item.unitPrice * item.quantity)}
              </p>

              <button
                type="button"
                onClick={() => removeItem(item.productId, item.size)}
                className="h-11 px-2 text-sm underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded-lg border border-ink/10 p-6">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatNaira(getCartSubtotal(items))}</span>
        </p>
        <p className="mt-2 text-sm text-ink/60">
          Delivery fee is added at checkout.
        </p>
        <Link
          href="/checkout"
          className="mt-6 flex h-12 items-center justify-center rounded bg-ink text-sm text-cream"
        >
          Checkout
        </Link>
      </aside>
    </div>
  );
}
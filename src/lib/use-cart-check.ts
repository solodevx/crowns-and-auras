"use client";

import { useEffect, useState } from "react";
import {
  checkCartAction,
  type CartLineStatus,
} from "@/app/(store)/cart/actions";
import type { CartItem } from "@/lib/cart-store";

export type CheckedItem = CartItem & {
  // "unknown" until the shop has answered
  status: "ok" | "unavailable" | "removed" | "unknown";
};

const keyOf = (productId: string, size: string) => `${productId}|${size}`;

// Compares the cart with what the shop has right now.
export function useCheckedCart(items: CartItem[]) {
  const [results, setResults] = useState<Record<string, CartLineStatus>>({});

  // Only ask again when the perfumes or sizes change, not on every quantity change
  const signature = JSON.stringify(
    items.map((item) => [item.productId, item.size]),
  );

  useEffect(() => {
    const pairs = JSON.parse(signature) as [string, string][];
    if (pairs.length === 0) return;

    let cancelled = false;
    checkCartAction(pairs.map(([productId, size]) => ({ productId, size })))
      .then((response) => {
        if (cancelled || !response.ok) return;
        setResults(
          Object.fromEntries(
            response.lines.map((line) => [
              keyOf(line.productId, line.size),
              line,
            ]),
          ),
        );
      })
      .catch(() => {
        // If the check can't run, the server still guards the order
      });

    return () => {
      cancelled = true;
    };
  }, [signature]);

  const checked: CheckedItem[] = items.map((item) => {
    const result = results[keyOf(item.productId, item.size)];
    if (!result) return { ...item, status: "unknown" };

    if (result.status === "ok") {
      return {
        ...item,
        status: "ok",
        unitPrice: result.unitPrice ?? item.unitPrice,
        image: result.image || item.image,
      };
    }
    return {
      ...item,
      status: result.status,
      image: result.image || item.image,
    };
  });

  const orderable = checked.filter(
    (item) => item.status === "ok" || item.status === "unknown",
  );
  const blocked = checked.filter(
    (item) => item.status === "unavailable" || item.status === "removed",
  );

  return { checked, orderable, blocked };
}
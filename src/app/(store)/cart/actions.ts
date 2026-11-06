"use server";

import { z } from "zod";
import { getProductById } from "@/lib/products";
import { checkRateLimit } from "@/lib/rate-limit";

const checkSchema = z
  .array(z.object({ productId: z.string().max(40), size: z.string().max(30) }))
  .max(20);

export type CartLineStatus = {
  productId: string;
  size: string;
  status: "ok" | "unavailable" | "removed";
  unitPrice?: number;
  image?: string;
};

export type CartCheckResult =
  | { ok: true; lines: CartLineStatus[] }
  | { ok: false };

// Read-only: asks the database what is true right now about each cart line.
// It never uses prices from the browser. It only sends the current ones back.
export async function checkCartAction(
  payload: unknown,
): Promise<CartCheckResult> {
  const rate = await checkRateLimit("cart-check", 120, 10 * 60);
  if (!rate.allowed) return { ok: false };

  const parsed = checkSchema.safeParse(payload);
  if (!parsed.success) return { ok: false };

  try {
    const lines: CartLineStatus[] = [];

    for (const line of parsed.data) {
      const product = await getProductById(line.productId);
      const variant = product?.variants.find(
        (candidate) => candidate.size === line.size,
      );

      if (!product || !variant) {
        lines.push({ ...line, status: "removed" });
      } else if (!variant.available) {
        lines.push({
          ...line,
          status: "unavailable",
          unitPrice: variant.price,
          image: product.images[0],
        });
      } else {
        lines.push({
          ...line,
          status: "ok",
          unitPrice: variant.price,
          image: product.images[0],
        });
      }
    }

    return { ok: true, lines };
  } catch (error) {
    console.error("cart check failed:", error);
    return { ok: false };
  }
}
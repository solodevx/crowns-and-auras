import { getProductById } from "@/lib/products";

// Server code can't import the limit from cart-store.ts (that file is
// browser-only), so the rule is written here again.
const MAX_QUANTITY = 10;

// What arrives from the customer's browser: UNTRUSTED. No prices on purpose.
export type CartLineInput = {
  productId: string;
  size: string;
  quantity: number;
};

// What we build from OUR OWN data: TRUSTED.
export type TrustedLine = {
  productId: string;
  brand: string;
  name: string;
  size: string;
  unitPrice: number;
  quantity: number;
};

// Either it worked and here are the lines, or it failed and here is why.
export type PriceCartResult =
  | { ok: true; lines: TrustedLine[] }
  | { ok: false; message: string };

export async function priceCart(
  inputs: CartLineInput[],
): Promise<PriceCartResult> {
  if (inputs.length === 0) {
    return { ok: false, message: "Your cart is empty" };
  }

  const lines: TrustedLine[] = [];

  try {
    for (const input of inputs) {
      const product = await getProductById(input.productId);
      if (!product) {
        return {
          ok: false,
          message: "A perfume in your cart is no longer available",
        };
      }

      const variant = product.variants.find(
        (candidate) => candidate.size === input.size,
      );
      if (!variant || !variant.available) {
        return {
          ok: false,
          message: `${product.name} (${input.size}) is no longer available`,
        };
      }

      if (
        !Number.isInteger(input.quantity) ||
        input.quantity < 1 ||
        input.quantity > MAX_QUANTITY
      ) {
        return { ok: false, message: "Invalid quantity" };
      }

      lines.push({
        productId: product.id,
        brand: product.brand,
        name: product.name,
        size: variant.size,
        unitPrice: variant.price,
        quantity: input.quantity,
      });
    }
  } catch (error) {
    // Database down or similar: log the real reason, show a friendly one
    console.error("priceCart failed:", error);
    return {
      ok: false,
      message: "Something went wrong on our side. Please try again.",
    };
  }

  return { ok: true, lines };
}

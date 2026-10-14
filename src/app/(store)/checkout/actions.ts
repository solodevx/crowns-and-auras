"use server";

import { randomInt } from "node:crypto";
import { z } from "zod";
import { getDeliveryZone } from "@/config/delivery-zones";
import { connectToDatabase } from "@/lib/db";
import { calculateOrderTotals } from "@/lib/order";
import { priceCart } from "@/lib/price-cart";
import { checkoutSchema } from "@/lib/validators";
import { Order } from "@/models/Order";

// Note what is NOT here: no prices. The browser only says what it wants.
const submissionSchema = z.object({
  submissionId: z.string().min(8).max(64),
  details: checkoutSchema,
  items: z
    .array(
      z.object({
        productId: z.string(),
        size: z.string(),
        quantity: z.number(),
      }),
    )
    .max(20, "Too many items in the cart"),
});

export type CreateOrderResult =
  | { ok: true; orderNumber: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

// No 0/O or 1/I/L, so numbers are easy to read out over WhatsApp
const ORDER_CODE_CHARACTERS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateOrderNumber(): string {
  let code = "";
  for (let position = 0; position < 6; position++) {
    code += ORDER_CODE_CHARACTERS[randomInt(ORDER_CODE_CHARACTERS.length)];
  }
  return `CA-${code}`;
}

// MongoDB error code 11000 means "that value must be unique and already exists".
function getDuplicateKeyField(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    if (error.code !== 11000) return null;
    const keyPattern = (error as { keyPattern?: Record<string, unknown> })
      .keyPattern;
    return keyPattern ? (Object.keys(keyPattern)[0] ?? "unknown") : "unknown";
  }
  return null;
}

// "unknown" = we have no idea what this is yet, and must check it
export async function createOrder(payload: unknown): Promise<CreateOrderResult> {
  const parsed = submissionSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "details" && typeof issue.path[1] === "string") {
        const field = issue.path[1];
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
    }
    return {
      ok: false,
      message: "Please check your details and try again.",
      fieldErrors,
    };
  }

  const { submissionId, details, items } = parsed.data;

  // Prices come from OUR data, never from the browser
  const priced = priceCart(items);
  if (!priced.ok) return { ok: false, message: priced.message };

  const zone = getDeliveryZone(details.zoneId);
  if (!zone) return { ok: false, message: "Please choose your delivery area" };

  const totals = calculateOrderTotals(priced.lines, details.zoneId);

  try {
    await connectToDatabase();

    // Same ticket stub twice? Return the order we already made.
    const existingOrder = await Order.findOne({ submissionId });
    if (existingOrder) {
      return { ok: true, orderNumber: existingOrder.orderNumber };
    }

    // Up to 3 tries, in case two orders randomly get the same number
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const order = await Order.create({
          orderNumber: generateOrderNumber(),
          submissionId,
          customer: {
            name: details.name,
            phone: details.phone,
            email: details.email || undefined,
          },
          delivery: { address: details.address, zone: zone.name },
          items: priced.lines,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          total: totals.total,
          notes: details.notes || undefined,
        });
        return { ok: true, orderNumber: order.orderNumber };
      } catch (error) {
        const duplicateField = getDuplicateKeyField(error);

        if (duplicateField === "submissionId") {
          const racedOrder = await Order.findOne({ submissionId });
          if (racedOrder) {
            return { ok: true, orderNumber: racedOrder.orderNumber };
          }
        }
        // Anything other than an order-number clash is a real problem
        if (duplicateField !== "orderNumber") throw error;
      }
    }

    return {
      ok: false,
      message: "We couldn't place your order. Please try again.",
    };
  } catch (error) {
    console.error("createOrder failed:", error);
    return {
      ok: false,
      message: "Something went wrong on our side. Please try again.",
    };
  }
}

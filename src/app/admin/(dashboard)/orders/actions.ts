"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { orderStatuses, type OrderStatus } from "@/config/order-status";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { ORDER_NUMBER_PATTERN } from "@/lib/orders";
import { Order } from "@/models/Order";

export type OrderActionResult = { ok: true } | { ok: false; message: string };

const orderNumberSchema = z.string().regex(ORDER_NUMBER_PATTERN);

const paymentSchema = z.object({
  orderNumber: orderNumberSchema,
  paymentStatus: z.enum(["paid", "unpaid"]),
});

const statusSchema = z.object({
  orderNumber: orderNumberSchema,
  status: z.enum(orderStatuses),
});

type OrderChanges =
  | { paymentStatus: "paid" | "unpaid" }
  | { status: OrderStatus };

async function applyChanges(
  orderNumber: string,
  changes: OrderChanges,
): Promise<OrderActionResult> {
  try {
    await connectToDatabase();
    const result = await Order.updateOne({ orderNumber }, { $set: changes });
    if (result.matchedCount === 0) {
      return { ok: false, message: "Order not found." };
    }
  } catch (error) {
    console.error("order update failed:", error);
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  // Refresh every admin page so the list, counts and details all update
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function setPaymentStatusAction(
  payload: unknown,
): Promise<OrderActionResult> {
  await requireAdmin(); // the lock: always first
  const parsed = paymentSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  return applyChanges(parsed.data.orderNumber, {
    paymentStatus: parsed.data.paymentStatus,
  });
}

export async function setOrderStatusAction(
  payload: unknown,
): Promise<OrderActionResult> {
  await requireAdmin(); // the lock: always first
  const parsed = statusSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  return applyChanges(parsed.data.orderNumber, { status: parsed.data.status });
}
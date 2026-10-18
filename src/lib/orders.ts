import { connectToDatabase } from "@/lib/db";
import { Order } from "@/models/Order";

// The exact format createOrder generates: CA- plus 6 safe characters
export const ORDER_NUMBER_PATTERN = /^CA-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6}$/;

// Only what the confirmation page needs. No phone, no address.
export type OrderSummary = {
  orderNumber: string;
  items: {
    brand: string;
    name: string;
    size: string;
    unitPrice: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export async function getOrderSummary(
  orderNumber: string,
): Promise<OrderSummary | null> {
  // Check the format BEFORE asking the database
  if (!ORDER_NUMBER_PATTERN.test(orderNumber)) return null;

  await connectToDatabase();
  const order = await Order.findOne({ orderNumber }).lean();
  if (!order) return null;

  return {
    orderNumber: order.orderNumber,
    items: order.items.map((item) => ({
      brand: item.brand,
      name: item.name,
      size: item.size,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    })),
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
  };
}

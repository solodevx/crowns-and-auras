import { getDeliveryZone } from "@/config/delivery-zones";

type PricedLine = { unitPrice: number; quantity: number };

export type OrderTotals = {
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export function calculateOrderTotals(
  lines: PricedLine[],
  zoneId: string,
): OrderTotals {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0,
  );
  const deliveryZone = getDeliveryZone(zoneId);
  const deliveryFee = deliveryZone ? deliveryZone.fee : 0;
  const total = subtotal + deliveryFee;

  return { subtotal, deliveryFee, total };
}

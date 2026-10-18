export const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "completed",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Orders that still need the owner's attention
export const openStatuses: OrderStatus[] = ["pending", "confirmed", "processing"];

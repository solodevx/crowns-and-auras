import "server-only";
import { connection } from "next/server";
import {
  openStatuses,
  orderStatuses,
  type OrderStatus,
} from "@/config/order-status";
import { requireAdmin } from "@/lib/admin-auth";
import { connectToDatabase } from "@/lib/db";
import { ORDER_NUMBER_PATTERN } from "@/lib/orders";
import { Order } from "@/models/Order";

export const orderViews = ["open", "completed", "cancelled", "all"] as const;
export type OrderView = (typeof orderViews)[number];

// Accepts only the four known words. Anything else becomes "open".
export function parseOrderView(value: string | string[] | undefined): OrderView {
  const candidate = Array.isArray(value) ? value[0] : value;
  return orderViews.find((view) => view === candidate) ?? "open";
}

// What an order looks like coming out of the database. Almost everything is
// optional on purpose: the database can't promise a field exists, so we fill
// in a safe default when we convert it.
type OrderRecord = {
  orderNumber: string;
  customer?: {
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null;
  delivery?: { address?: string | null; zone?: string | null } | null;
  items?:
    | {
        brand?: string | null;
        name?: string | null;
        size?: string | null;
        unitPrice?: number | null;
        quantity?: number | null;
      }[]
    | null;
  subtotal?: number | null;
  deliveryFee?: number | null;
  total?: number | null;
  status?: string | null;
  paymentStatus?: string | null;
  notes?: string | null;
  createdAt?: Date | null;
};

// Only accept a status we know. Anything else shows as "pending".
function toStatus(value: string | null | undefined): OrderStatus {
  return orderStatuses.find((status) => status === value) ?? "pending";
}

// ── The list ──

export type AdminOrderRow = {
  orderNumber: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: "paid" | "unpaid";
  createdAt: string; // ISO text, formatted on the page
};

function toRow(record: OrderRecord): AdminOrderRow {
  return {
    orderNumber: record.orderNumber,
    customerName: record.customer?.name ?? "",
    itemCount: (record.items ?? []).reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0,
    ),
    total: record.total ?? 0,
    status: toStatus(record.status),
    paymentStatus: record.paymentStatus === "paid" ? "paid" : "unpaid",
    createdAt: record.createdAt ? record.createdAt.toISOString() : "",
  };
}

export async function getAdminOrders(view: OrderView): Promise<AdminOrderRow[]> {
  await requireAdmin(); // lock the data door
  await connection();
  await connectToDatabase();

  const filter =
    view === "open"
      ? { status: { $in: openStatuses } }
      : view === "all"
        ? {}
        : { status: view };

  const records = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  return records.map(toRow);
}

// ── The counts for the dashboard ──

export async function getOrderCounts(): Promise<{
  open: number;
  awaitingPayment: number;
}> {
  await requireAdmin();
  await connection();
  await connectToDatabase();

  const openCount = await Order.countDocuments({
    status: { $in: openStatuses },
  });

  const awaitingPaymentCount = await Order.countDocuments({
    status: { $in: openStatuses },
    paymentStatus: "unpaid",
  });

  return { open: openCount, awaitingPayment: awaitingPaymentCount };
}

// ── One order in full ──

export type AdminOrderDetail = {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: "paid" | "unpaid";
  createdAt: string;
  customer: { name: string; phone: string; email: string };
  delivery: { address: string; zone: string };
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
  notes: string;
};

function toDetail(record: OrderRecord): AdminOrderDetail {
  return {
    orderNumber: record.orderNumber,
    status: toStatus(record.status),
    paymentStatus: record.paymentStatus === "paid" ? "paid" : "unpaid",
    createdAt: record.createdAt ? record.createdAt.toISOString() : "",
    customer: {
      name: record.customer?.name ?? "",
      phone: record.customer?.phone ?? "",
      email: record.customer?.email ?? "",
    },
    delivery: {
      address: record.delivery?.address ?? "",
      zone: record.delivery?.zone ?? "",
    },
    items: (record.items ?? []).map((item) => ({
      brand: item.brand ?? "",
      name: item.name ?? "",
      size: item.size ?? "",
      unitPrice: item.unitPrice ?? 0,
      quantity: item.quantity ?? 0,
    })),
    subtotal: record.subtotal ?? 0,
    deliveryFee: record.deliveryFee ?? 0,
    total: record.total ?? 0,
    notes: record.notes ?? "",
  };
}

export async function getAdminOrderDetail(
  orderNumber: string,
): Promise<AdminOrderDetail | null> {
  await requireAdmin(); // lock the data door
  if (!ORDER_NUMBER_PATTERN.test(orderNumber)) return null;

  await connection();
  await connectToDatabase();
  const record = await Order.findOne({ orderNumber }).lean();
  return record ? toDetail(record) : null;
}
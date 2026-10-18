import { Suspense } from "react";
import Link from "next/link";
import { orderStatusLabels } from "@/config/order-status";
import {
  getAdminOrders,
  orderViews,
  parseOrderView,
} from "@/lib/admin-orders";
import type { SearchParams } from "@/lib/filter-products";
import { formatDateTime, formatNaira } from "@/lib/format";

export const metadata = { title: "Orders" };

type OrdersPageProps = { searchParams: Promise<SearchParams> };

const viewLabels = {
  open: "Open",
  completed: "Completed",
  cancelled: "Cancelled",
  all: "All",
} as const;

export default function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  return (
    <>
      <h1 className="font-serif text-3xl">Orders</h1>
      <Suspense fallback={<p className="mt-6 text-ink/60">Loading orders…</p>}>
        <OrdersContent searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function OrdersContent({ searchParams }: OrdersPageProps) {
  const view = parseOrderView((await searchParams).view);
  const orders = await getAdminOrders(view);

  return (
    <>
      <nav aria-label="Order views" className="mt-6 flex flex-wrap gap-2">
        {orderViews.map((option) => (
          <Link
            key={option}
            href={`/admin/orders?view=${option}`}
            aria-current={option === view ? "page" : undefined}
            className={`inline-flex h-11 items-center rounded-full border px-5 text-sm ${
              option === view
                ? "border-ink bg-ink text-cream"
                : "border-ink/20"
            }`}
          >
            {viewLabels[option]}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="mt-8 text-ink/70">No orders here yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-ink/10 rounded-lg border border-ink/10">
          {orders.map((order) => (
            <li key={order.orderNumber}>
              <Link
                href={`/admin/orders/${order.orderNumber}`}
                className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-ink/5"
              >
                <div>
                  <p className="font-medium tracking-wider">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-ink/70">
                    {order.customerName} · {order.itemCount}{" "}
                    {order.itemCount === 1 ? "item" : "items"}
                  </p>
                  <p className="text-xs text-ink/50">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <p className="font-medium">{formatNaira(order.total)}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="rounded bg-ink/10 px-2 py-1">
                      {orderStatusLabels[order.status]}
                    </span>
                    <span
                      className={`rounded px-2 py-1 ${
                        order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { orderStatusLabels } from "@/config/order-status";
import { siteConfig } from "@/config/site";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminOrderDetail } from "@/lib/admin-orders";
import { formatDateTime, formatNaira } from "@/lib/format";
import { buildWhatsAppLink, toWhatsAppNumber } from "@/lib/whatsapp";

export const metadata = { title: "Order details" };

type OrderDetailPageProps = { params: Promise<{ orderNumber: string }> };

export default function AdminOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  return (
    <>
      <Link href="/admin/orders" className="text-sm underline">
        Back to orders
      </Link>
      <Suspense fallback={<p className="mt-6 text-ink/60">Loading order…</p>}>
        <OrderDetailContent params={params} />
      </Suspense>
    </>
  );
}

async function OrderDetailContent({ params }: OrderDetailPageProps) {
  await requireAdmin();
  const { orderNumber } = await params;
  const order = await getAdminOrderDetail(orderNumber);

  if (!order) notFound();

  const whatsappLink = buildWhatsAppLink(
    toWhatsAppNumber(order.customer.phone),
    `Hello ${order.customer.name}, this is ${siteConfig.name} about your order ${order.orderNumber}.`,
  );

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl tracking-wider">
            {order.orderNumber}
          </h1>
          <p className="text-sm text-ink/60">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="rounded bg-ink/10 px-3 py-1">
            {orderStatusLabels[order.status]}
          </span>
          <span
            className={`rounded px-3 py-1 ${
              order.paymentStatus === "paid"
                ? "bg-green-100 text-green-900"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-ink/10 p-5">
          <h2 className="font-serif text-xl">Customer</h2>
          <p className="mt-3">{order.customer.name}</p>
          <p className="mt-1 text-sm">
            <a href={`tel:${order.customer.phone}`} className="underline">
              {order.customer.phone}
            </a>
          </p>
          {order.customer.email && (
            <p className="mt-1 text-sm">{order.customer.email}</p>
          )}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-11 items-center rounded border border-ink px-5 text-sm"
          >
            Message on WhatsApp (opens WhatsApp)
          </a>
        </section>

        <section className="rounded-lg border border-ink/10 p-5">
          <h2 className="font-serif text-xl">Delivery</h2>
          <p className="mt-3 whitespace-pre-line">{order.delivery.address}</p>
          <p className="mt-2 text-sm text-ink/70">Area: {order.delivery.zone}</p>
          {order.notes && (
            <>
              <h3 className="mt-4 text-sm font-medium">Customer notes</h3>
              <p className="mt-1 whitespace-pre-line text-sm">{order.notes}</p>
            </>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-ink/10 p-5">
        <h2 className="font-serif text-xl">Items</h2>
        <ul className="mt-3 divide-y divide-ink/10 text-sm">
          {order.items.map((item) => (
            <li
              key={`${item.name}-${item.size}`}
              className="flex justify-between gap-4 py-3"
            >
              <span>
                {item.brand} {item.name} ({item.size}) x {item.quantity}
              </span>
              <span>{formatNaira(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatNaira(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{formatNaira(order.deliveryFee)}</dd>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatNaira(order.total)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
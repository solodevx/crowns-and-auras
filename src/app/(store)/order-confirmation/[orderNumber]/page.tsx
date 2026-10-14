import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import ClearCartOnMount from "@/components/store/ClearCartOnMount";
import { bankDetails } from "@/config/payment";
import { siteConfig } from "@/config/site";
import { formatNaira } from "@/lib/format";
import { getOrderSummary } from "@/lib/orders";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// robots: don't let search engines index order pages
export const metadata = {
  title: "Order received",
  robots: { index: false },
};

type OrderConfirmationProps = { params: Promise<{ orderNumber: string }> };

export default function OrderConfirmationPage({
  params,
}: OrderConfirmationProps) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <Suspense fallback={<p className="text-ink/60">Loading your order…</p>}>
        <OrderDetails params={params} />
      </Suspense>
    </section>
  );
}

async function OrderDetails({ params }: OrderConfirmationProps) {
  const { orderNumber } = await params;
  await connection(); // this page must be built live, per visit
  const order = await getOrderSummary(orderNumber);

  if (!order) notFound();

  const whatsappMessage = `Hello, I have paid for order ${order.orderNumber} (${formatNaira(order.total)}). Here is my proof of payment.`;
  const whatsappLink = buildWhatsAppLink(siteConfig.whatsappNumber, whatsappMessage);

  return (
    <>
      <ClearCartOnMount />

      <h1 className="font-serif text-3xl">Thank you! Your order is in.</h1>
      <p className="mt-4 text-ink/70">Your order number</p>
      <p className="mt-1 font-serif text-3xl tracking-widest">
        {order.orderNumber}
      </p>

      <div className="mt-8 rounded-lg border border-ink/10 p-6">
        <h2 className="font-serif text-xl">Pay by bank transfer</h2>
        <p className="mt-2 text-sm text-ink/70">
          Please transfer <strong>{formatNaira(order.total)}</strong> to the
          account below and use <strong>{order.orderNumber}</strong> as the
          reference.
        </p>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Bank</dt>
            <dd>{bankDetails.bankName}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Account name</dt>
            <dd>{bankDetails.accountName}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Account number</dt>
            <dd>{bankDetails.accountNumber}</dd>
          </div>
        </dl>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex h-12 items-center justify-center rounded bg-ink text-sm text-cream"
        >
          Send payment proof on WhatsApp (opens WhatsApp)
        </a>
        <p className="mt-3 text-sm text-ink/60">
          We confirm your order once we see your payment.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="font-serif text-xl">Your order</h2>
        <ul className="mt-3 divide-y divide-ink/10 text-sm">
          {order.items.map((item) => (
            <li
              key={`${item.name}-${item.size}`}
              className="flex justify-between gap-4 py-3"
            >
              <span>
                {item.name} ({item.size}) x {item.quantity}
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
      </div>

      <Link href="/shop" className="mt-8 inline-block text-sm underline">
        Continue shopping
      </Link>
    </>
  );
}

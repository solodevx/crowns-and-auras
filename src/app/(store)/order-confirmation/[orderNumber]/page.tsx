import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import ClearCartOnMount from "@/components/store/ClearCartOnMount";
import CopyButton from "@/components/store/CopyButton";
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
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <Suspense
        fallback={
          <p className="text-center text-ink/70">Loading your order…</p>
        }
      >
        <OrderDetails params={params} />
      </Suspense>
    </section>
  );
}

async function OrderDetails({ params }: OrderConfirmationProps) {
  await connection(); // this page must be built live, per visit
  const { orderNumber } = await params;
  const order = await getOrderSummary(orderNumber);

  if (!order) notFound();

  const whatsappLink = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    `Hello, I have paid for order ${order.orderNumber} (${formatNaira(order.total)}). Here is my proof of payment.`,
  );

  return (
    <>
      <ClearCartOnMount />

      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ink/70">
          Thank you
        </p>
        <h1 className="mt-3 font-serif text-3xl uppercase tracking-[0.3em] md:text-4xl">
          Your order is in
        </h1>
        <span
          aria-hidden="true"
          className="mx-auto mt-4 block h-1.5 w-1.5 rounded-full bg-gold"
        />
        <p className="mt-6 text-sm text-ink/70">Your order number</p>
        <p className="mt-1 flex flex-wrap items-center justify-center gap-x-3 font-serif text-3xl tracking-widest">
          {order.orderNumber}
          <CopyButton value={order.orderNumber} label="order number" />
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
        <section aria-labelledby="pay-heading">
          <h2
            id="pay-heading"
            className="border-b border-ink/15 pb-3 font-serif text-2xl"
          >
            How to pay
          </h2>

          <ol className="mt-6 space-y-9">
            <li className="flex gap-5">
              <span className="font-serif text-4xl leading-none">1</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">Transfer the total</p>
                <p className="mt-1 text-sm text-ink/80">
                  Send <strong>{formatNaira(order.total)}</strong> to the
                  account below. Please put <strong>{order.orderNumber}</strong>{" "}
                  as the reference so we can find your payment.
                </p>

                <dl className="mt-4 divide-y divide-ink/10 border-y border-ink/10 text-sm">
                  <div className="flex items-center justify-between gap-4 py-2">
                    <dt className="text-ink/70">Bank</dt>
                    <dd>{bankDetails.bankName}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-2">
                    <dt className="text-ink/70">Account name</dt>
                    <dd>{bankDetails.accountName}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-1">
                    <dt className="text-ink/70">Account number</dt>
                    <dd className="flex items-center gap-2">
                      <span className="font-serif text-xl tracking-wider">
                        {bankDetails.accountNumber}
                      </span>
                      <CopyButton
                        value={bankDetails.accountNumber}
                        label="account number"
                      />
                    </dd>
                  </div>
                </dl>
              </div>
            </li>

            <li className="flex gap-5">
              <span className="font-serif text-4xl leading-none">2</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">Send us your proof</p>
                <p className="mt-1 text-sm text-ink/80">
                  After you pay, send a screenshot of the transfer on WhatsApp.
                  The message is already written for you.
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-12 items-center bg-ink px-8 text-xs uppercase tracking-[0.2em] text-cream hover:bg-accent"
                >
                  Send payment proof on WhatsApp (opens WhatsApp)
                </a>
              </div>
            </li>

            <li className="flex gap-5">
              <span className="font-serif text-4xl leading-none">3</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">We confirm and deliver</p>
                <p className="mt-1 text-sm text-ink/80">
                  We confirm your order once we see your payment, then we
                  arrange your delivery.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <aside
          aria-label="Order summary"
          className="h-fit border-t-2 border-gold bg-ink p-6 text-cream lg:sticky lg:top-28"
        >
          <h2 className="font-serif text-xl">Order summary</h2>
          <div className="mt-3 border-t border-cream/15" />

          <ul className="mt-2 divide-y divide-cream/15">
            {order.items.map((item) => (
              <li
                key={`${item.name}-${item.size}`}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-serif text-base leading-snug">
                    {item.name}
                  </p>
                  <p className="text-xs text-cream/75">
                    {item.brand} · {item.size} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm">
                  {formatNaira(item.unitPrice * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-2 space-y-2 border-t border-cream/15 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-cream/75">Subtotal</dt>
              <dd className="text-gold">{formatNaira(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cream/75">Delivery</dt>
              <dd>{formatNaira(order.deliveryFee)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-cream/15 pt-3">
              <dt className="font-medium">Total</dt>
              <dd className="font-serif text-3xl text-gold">
                {formatNaira(order.total)}
              </dd>
            </div>
          </dl>

          <Link
            href="/shop"
            className="mt-5 inline-flex h-11 items-center text-xs uppercase tracking-[0.15em] underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </>
  );
}
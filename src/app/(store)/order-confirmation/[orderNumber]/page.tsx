import { Suspense } from "react";
import ClearCartOnMount from "@/components/store/ClearCartOnMount";

export const metadata = { title: "Order received" };

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

  return (
    <>
      <ClearCartOnMount />
      <h1 className="font-serif text-3xl">Thank you! Your order is in.</h1>
      <p className="mt-4 text-ink/70">Your order number is</p>
      <p className="mt-1 font-serif text-3xl tracking-widest">{orderNumber}</p>
      <p className="mt-6 text-ink/70">
        Payment details are coming in the next update.
      </p>
    </>
  );
}

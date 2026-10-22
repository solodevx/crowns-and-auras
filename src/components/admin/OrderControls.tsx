"use client";

import { useState, useTransition } from "react";
import {
  setOrderStatusAction,
  setPaymentStatusAction,
  type OrderActionResult,
} from "@/app/admin/(dashboard)/orders/actions";
import {
  orderStatuses,
  orderStatusLabels,
  type OrderStatus,
} from "@/config/order-status";

type OrderControlsProps = {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: "paid" | "unpaid";
};

export default function OrderControls({
  orderNumber,
  status,
  paymentStatus,
}: OrderControlsProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  // Runs a server action, shows "Saving…" meanwhile, and reports any failure
  function run(action: () => Promise<OrderActionResult>) {
    setMessage("");
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setMessage(result.message);
    });
  }

  function markPaid() {
    const sure = window.confirm("Have you seen this payment in your bank app?");
    if (!sure) return;
    run(() => setPaymentStatusAction({ orderNumber, paymentStatus: "paid" }));
  }

  function markUnpaid() {
    run(() => setPaymentStatusAction({ orderNumber, paymentStatus: "unpaid" }));
  }

  function changeStatus(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    run(() => setOrderStatusAction({ orderNumber, status: next }));
  }

  return (
    <section
      className="mt-6 rounded-lg border border-ink/10 p-5"
      aria-busy={isPending}
    >
      <h2 className="font-serif text-xl">Manage order</h2>

      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium">Payment</p>
          {paymentStatus === "unpaid" ? (
            <>
              <button
                type="button"
                onClick={markPaid}
                disabled={isPending}
                className="mt-2 h-11 rounded bg-ink px-5 text-sm text-cream disabled:opacity-60"
              >
                Mark as paid
              </button>
              <p className="mt-2 text-xs text-ink/70">
                Only after you see the money in your bank app, never from a
                screenshot alone.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm">Paid</p>
              <button
                type="button"
                onClick={markUnpaid}
                disabled={isPending}
                className="mt-2 h-11 text-sm underline disabled:opacity-60"
              >
                Undo: mark as unpaid
              </button>
            </>
          )}
        </div>

        <div>
          <label htmlFor="order-status" className="text-sm font-medium">
            Order status
          </label>
          <select
            id="order-status"
            value={status}
            onChange={changeStatus}
            disabled={isPending}
            className="mt-2 h-11 w-full rounded border border-ink/20 bg-white px-3 disabled:opacity-60"
          >
            {orderStatuses.map((option) => (
              <option key={option} value={option}>
                {orderStatusLabels[option]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p role="status" className="mt-3 min-h-5 text-sm">
        {isPending ? "Saving…" : ""}
      </p>
      <p role="alert" className="text-sm text-red-700">
        {message}
      </p>
    </section>
  );
}
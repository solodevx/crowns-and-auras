"use client";

import { useState } from "react";
import Link from "next/link";
import { deliveryZones, getDeliveryZone } from "@/config/delivery-zones";
import { useCartItems } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";
import { calculateOrderTotals } from "@/lib/order";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators";

type FormValues = {
  name: string;
  phone: string;
  email: string;
  address: string;
  zoneId: string;
  notes: string;
};

type FieldErrors = Partial<Record<keyof CheckoutInput, string>>;

const emptyValues: FormValues = {
  name: "",
  phone: "",
  email: "",
  address: "",
  zoneId: "",
  notes: "",
};

const inputClassName =
  "mt-1 h-11 w-full rounded border border-ink/20 bg-white px-3";
const textareaClassName =
  "mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
      {message}
    </p>
  );
}

export default function CheckoutForm() {
  const items = useCartItems();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = checkoutSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CheckoutInput;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      setStatus("");

      const firstField = Object.keys(fieldErrors)[0];
      document.getElementById(firstField)?.focus();
      return;
    }

    setErrors({});
    // TODO (CA-9): send result.data to the server to create the order
    console.log("Valid details:", result.data);
    setStatus("Details look good. Saving the order comes in the next ticket.");
  }

  function fieldProps(name: keyof FormValues) {
    return {
      id: name,
      name,
      value: values[name],
      onChange: handleChange,
      "aria-invalid": errors[name] ? true : undefined,
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
    };
  }

  // Figured out on every change, so the summary is always up to date
  const selectedZone = getDeliveryZone(values.zoneId);
  const totals = calculateOrderTotals(items, values.zoneId);

  // All hooks are above this line, so the early return is safe
  if (items.length === 0) {
    return (
      <div className="mt-8">
        <p className="text-ink/70">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-4 inline-flex h-11 items-center rounded bg-ink px-6 text-sm text-cream"
        >
          Browse perfumes
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-8 grid gap-8 md:grid-cols-[1fr_22rem]"
    >
      <div className="max-w-xl space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Full name
          </label>
          <input
            {...fieldProps("name")}
            type="text"
            autoComplete="name"
            className={inputClassName}
          />
          <FieldError id="name" message={errors.name} />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone number
          </label>
          <input
            {...fieldProps("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="08012345678"
            className={inputClassName}
          />
          <FieldError id="phone" message={errors.phone} />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email <span className="font-normal text-ink/60">(optional)</span>
          </label>
          <input
            {...fieldProps("email")}
            type="email"
            autoComplete="email"
            className={inputClassName}
          />
          <FieldError id="email" message={errors.email} />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium">
            Delivery address
          </label>
          <textarea
            {...fieldProps("address")}
            rows={3}
            autoComplete="street-address"
            className={textareaClassName}
          />
          <FieldError id="address" message={errors.address} />
        </div>

        <div>
          <label htmlFor="zoneId" className="block text-sm font-medium">
            Delivery area
          </label>
          <select {...fieldProps("zoneId")} className={inputClassName}>
            <option value="">Choose your area</option>
            {deliveryZones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} - {formatNaira(zone.fee)}
              </option>
            ))}
          </select>
          <FieldError id="zoneId" message={errors.zoneId} />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium">
            Notes <span className="font-normal text-ink/60">(optional)</span>
          </label>
          <textarea
            {...fieldProps("notes")}
            rows={2}
            className={textareaClassName}
          />
          <FieldError id="notes" message={errors.notes} />
        </div>
      </div>

      <aside className="h-fit rounded-lg border border-ink/10 p-6">
        <h2 className="font-serif text-xl">Order summary</h2>

        <ul className="mt-4 divide-y divide-ink/10 text-sm">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}`}
              className="flex justify-between gap-4 py-3"
            >
              <span>
                {item.name} ({item.size}) x {item.quantity}
              </span>
              <span>{formatNaira(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd>{formatNaira(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>
              {selectedZone ? formatNaira(totals.deliveryFee) : "Choose your area"}
            </dd>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-medium">
            <dt>Total</dt>
            <dd>{formatNaira(totals.total)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm text-ink/60">
          After you place your order, you will get our bank details to pay by
          transfer.
        </p>

        <button
          type="submit"
          className="mt-6 h-12 w-full rounded bg-ink px-8 text-sm text-cream"
        >
          Place order
        </button>

        <p role="status" className="mt-3 text-sm">
          {status}
        </p>

        <Link href="/cart" className="mt-4 inline-block text-sm underline">
          Back to cart
        </Link>
      </aside>
    </form>
  );
}

"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { createOrder } from "@/app/(store)/checkout/actions";
import { deliveryZones, getDeliveryZone } from "@/config/delivery-zones";
import { useCartItems, type CartItem } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";
import { optimizedImageUrl } from "@/lib/image-url";
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
  "mt-1 h-11 w-full border border-ink/20 bg-white/70 px-3 text-sm";
const textareaClassName =
  "mt-1 w-full border border-ink/20 bg-white/70 px-3 py-2 text-sm";

function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {optional && (
          <span className="font-normal text-ink/70"> (optional)</span>
        )}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink/70">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function MiniThumb({ item }: { item: CartItem }) {
  // The cart lives in the browser, so only trust pictures from our own image library
  const image = item.image?.startsWith("https://res.cloudinary.com/")
    ? item.image
    : "";

  return (
    <span className="relative block h-14 w-11 shrink-0 overflow-hidden border border-cream/20 bg-white">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={optimizedImageUrl(image, 88, 112)}
          alt=""
          width={44}
          height={56}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full items-center justify-center font-serif text-base text-ink/40"
        >
          {item.brand.charAt(0)}
        </span>
      )}
    </span>
  );
}

function focusFirstError(fieldErrors: FieldErrors) {
  const firstField = Object.keys(fieldErrors)[0];
  if (firstField) document.getElementById(firstField)?.focus();
}

export default function CheckoutForm() {
  const router = useRouter();
  const items = useCartItems();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, startNavigation] = useTransition();
  const isBusy = isSubmitting || isNavigating;

  // The "ticket stub" for this order. It is created once and survives redraws,
  // so pressing Place order twice sends the same stub both times.
  const submissionIdRef = useRef<string | null>(null);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;
    setFormError("");

    // First check, in the browser, for quick friendly messages
    const result = checkoutSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CheckoutInput;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }

    setErrors({});
    submissionIdRef.current ??= crypto.randomUUID();
    setIsSubmitting(true);

    try {
      // We send what the customer WANTS. Never prices: the server looks those up.
      const response = await createOrder({
        submissionId: submissionIdRef.current,
        details: result.data,
        items: items.map((item) => ({
          productId: item.productId,
          size: item.size,
          quantity: item.quantity,
        })),
      });

      if (response.ok) {
        startNavigation(() => {
          router.push(`/order-confirmation/${response.orderNumber}`);
        });
        setIsSubmitting(false);
        return;
      }

      if (response.fieldErrors) {
        const serverErrors = response.fieldErrors as FieldErrors;
        setErrors(serverErrors);
        focusFirstError(serverErrors);
      }
      setFormError(response.message);
    } catch {
      setFormError(
        "Could not reach the server. Check your connection and try again.",
      );
    }

    setIsSubmitting(false);
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

  const selectedZone = getDeliveryZone(values.zoneId);
  const totals = calculateOrderTotals(items, values.zoneId);

  // All hooks are above this line, so the early return is safe
  if (items.length === 0) {
    return (
      <div className="mt-10 border-y border-ink/15 py-16 text-center">
        <p className="font-serif text-2xl">Your cart is empty</p>
        <p className="mt-2 text-sm text-ink/70">
          Add a perfume before you check out.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-12 items-center bg-ink px-8 text-xs uppercase tracking-[0.2em] text-cream hover:bg-accent"
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
      aria-busy={isBusy}
      className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14"
    >
      {/* The form sits directly on the page: no cards, only headings and thin lines */}
      <div className="space-y-12">
        <section aria-labelledby="details-heading">
          <h2
            id="details-heading"
            className="border-b border-ink/15 pb-3 font-serif text-2xl"
          >
            Your details
          </h2>
          <div className="mt-6 space-y-5">
            <Field id="name" label="Full name" error={errors.name}>
              <input
                {...fieldProps("name")}
                type="text"
                autoComplete="name"
                className={inputClassName}
              />
            </Field>

            <Field
              id="phone"
              label="Phone number"
              hint="We use it to reach you about your order."
              error={errors.phone}
            >
              <input
                {...fieldProps("phone")}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="08012345678"
                className={inputClassName}
              />
            </Field>

            <Field id="email" label="Email" optional error={errors.email}>
              <input
                {...fieldProps("email")}
                type="email"
                autoComplete="email"
                className={inputClassName}
              />
            </Field>
          </div>
        </section>

        <section aria-labelledby="delivery-heading">
          <h2
            id="delivery-heading"
            className="border-b border-ink/15 pb-3 font-serif text-2xl"
          >
            Delivery
          </h2>
          <div className="mt-6 space-y-5">
            <Field id="address" label="Delivery address" error={errors.address}>
              <textarea
                {...fieldProps("address")}
                rows={3}
                autoComplete="street-address"
                className={textareaClassName}
              />
            </Field>

            <Field id="zoneId" label="Delivery area" error={errors.zoneId}>
              <select {...fieldProps("zoneId")} className={inputClassName}>
                <option value="">Choose your area</option>
                {deliveryZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} - {formatNaira(zone.fee)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="notes"
              label="Notes"
              optional
              hint="Anything we should know about your delivery?"
              error={errors.notes}
            >
              <textarea
                {...fieldProps("notes")}
                rows={2}
                className={textareaClassName}
              />
            </Field>
          </div>
        </section>
      </div>

      {/* The plum panel, with a thin gold line along the top */}
      <aside
        aria-label="Order summary"
        className="h-fit border-t-2 border-gold bg-ink p-6 text-cream lg:sticky lg:top-28"
      >
        <h2 className="font-serif text-xl">Order summary</h2>
        <div className="mt-3 border-t border-cream/15" />

        <ul className="mt-2 divide-y divide-cream/15">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.size}`}
              className="flex items-center gap-3 py-3"
            >
              <MiniThumb item={item} />
              <div className="min-w-0 flex-1">
                <p className="font-serif text-base leading-snug">{item.name}</p>
                <p className="text-xs text-cream/75">
                  {item.size} × {item.quantity}
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
            <dd className="text-gold">{formatNaira(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-cream/75">Delivery</dt>
            <dd>
              {selectedZone
                ? formatNaira(totals.deliveryFee)
                : "Choose your area"}
            </dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-cream/15 pt-3">
            <dt className="font-medium">Total</dt>
            <dd className="font-serif text-3xl text-gold">
              {formatNaira(totals.total)}
            </dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={isBusy}
          className="mt-6 flex h-12 w-full items-center justify-center bg-gold text-xs font-medium uppercase tracking-[0.2em] text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? "Placing your order..." : "Place order"}
        </button>

        <p role="alert" className="mt-3 min-h-5 text-sm text-red-200">
          {formError}
        </p>

        <p className="mt-4 flex items-start gap-3 border-t border-cream/15 pt-4 text-sm text-cream/80">
          <Landmark
            className="mt-0.5 h-5 w-5 shrink-0"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span>
            After you place your order, you will get our bank details to pay by
            transfer.
          </span>
        </p>

        <Link
          href="/cart"
          className="mt-4 inline-flex h-11 items-center text-xs uppercase tracking-[0.15em] underline underline-offset-4"
        >
          ← Back to cart
        </Link>
      </aside>
    </form>
  );
}
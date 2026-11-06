"use client";

import { useState } from "react";
import Link from "next/link";
import { Landmark, Minus, Plus, Trash2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  MAX_QUANTITY,
  clearCart,
  getCartCount,
  getCartSubtotal,
  removeItem,
  updateQuantity,
  useCartItems,
} from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";
import { optimizedImageUrl } from "@/lib/image-url";
import { useCheckedCart, type CheckedItem } from "@/lib/use-cart-check";
import { buildWhatsAppLink } from "@/lib/whatsapp";

// The colour of the right-hand panel: "plum" (dark) or "lavender" (soft)
const PANEL_TONE: "plum" | "lavender" = "plum";

const panelTones = {
  plum: {
    panel: "bg-ink text-cream",
    line: "border-cream/15",
    muted: "text-cream/75",
    amount: "text-gold",
    button: "bg-gold text-ink hover:brightness-110",
    disabledButton: "bg-cream/15 text-cream/60",
  },
  lavender: {
    panel: "bg-lavender text-ink",
    line: "border-ink/15",
    muted: "text-ink/85",
    amount: "text-ink",
    button: "bg-ink text-cream hover:bg-accent",
    disabledButton: "bg-ink/20 text-ink/60",
  },
} as const;

// Column widths on tablets and up: product | quantity | price | remove
const tableColumns = "sm:grid-cols-[1fr_8.5rem_7rem_2.75rem]";

function isBlocked(item: CheckedItem) {
  return item.status === "unavailable" || item.status === "removed";
}

function Thumb({ item, large }: { item: CheckedItem; large?: boolean }) {
  // The cart lives in the browser, so only trust pictures from our own image library
  const image = item.image?.startsWith("https://res.cloudinary.com/")
    ? item.image
    : "";
  const size = large ? "h-32 w-24" : "h-24 w-[4.5rem]";

  return (
    <span
      className={`relative block shrink-0 overflow-hidden border border-ink/10 bg-white ${size}`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={optimizedImageUrl(image, 192, 256)}
          alt=""
          width={96}
          height={128}
          className="h-full w-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-full items-center justify-center font-serif text-xl text-ink/40"
        >
          {item.brand.charAt(0)}
        </span>
      )}
    </span>
  );
}

function QuantityControl({ item }: { item: CheckedItem }) {
  const label = `${item.name} (${item.size})`;

  return (
    <div
      role="group"
      aria-label={`Quantity of ${label}`}
      className="inline-flex items-center border border-ink/20 bg-white/60"
    >
      <button
        type="button"
        aria-label={`Decrease quantity of ${label}`}
        disabled={item.quantity <= 1}
        onClick={() =>
          updateQuantity(item.productId, item.size, item.quantity - 1)
        }
        className="inline-flex h-11 w-11 items-center justify-center disabled:opacity-30"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="w-10 text-center text-sm" aria-live="polite">
        {item.quantity}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${label}`}
        disabled={item.quantity >= MAX_QUANTITY}
        onClick={() =>
          updateQuantity(item.productId, item.size, item.quantity + 1)
        }
        className="inline-flex h-11 w-11 items-center justify-center disabled:opacity-30"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function RemoveButton({ item }: { item: CheckedItem }) {
  return (
    <button
      type="button"
      aria-label={`Remove ${item.name} (${item.size}) from cart`}
      onClick={() => removeItem(item.productId, item.size)}
      className="inline-flex h-11 w-11 items-center justify-center text-ink/70 hover:text-ink"
    >
      <Trash2 className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
    </button>
  );
}

function ItemName({ item }: { item: CheckedItem }) {
  return (
    <Link
      href={`/shop/${item.slug}`}
      className="block font-serif text-lg font-semibold leading-snug hover:underline sm:text-xl"
    >
      {item.name}
    </Link>
  );
}

function CartRow({ item }: { item: CheckedItem }) {
  const blocked = isBlocked(item);
  const blockedMessage =
    item.status === "removed" ? "No longer sold" : "Unavailable right now";
  const lineTotal = formatNaira(item.unitPrice * item.quantity);

  return (
    <li
      className={`border-b border-ink/10 py-6 ${blocked ? "opacity-60" : ""}`}
    >
      {/* Phones: one tidy block per item */}
      <div className="sm:hidden">
        <div className="flex items-start gap-4">
          <Thumb item={item} large />
          <div className="min-w-0 flex-1">
            <ItemName item={item} />
            <p className="mt-1 text-xs text-ink/70">Size: {item.size}</p>
            <p className="text-xs text-ink/70">{item.brand}</p>
            {!blocked && (
              <p className="mt-3 text-sm">
                {formatNaira(item.unitPrice)}{" "}
                <span className="text-ink/70">each</span>
              </p>
            )}
          </div>
          <div className="-mr-2 -mt-2">
            <RemoveButton item={item} />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
          {blocked ? (
            <p className="text-sm font-medium">{blockedMessage}</p>
          ) : (
            <>
              <p>
                <span className="block text-[0.6875rem] uppercase tracking-[0.2em] text-ink/70">
                  Total
                </span>
                <span className="text-lg font-medium">{lineTotal}</span>
              </p>
              <QuantityControl item={item} />
            </>
          )}
        </div>
      </div>

      {/* Tablets and up: a table row */}
      <div className={`hidden items-center gap-x-4 sm:grid ${tableColumns}`}>
        <div className="flex items-center gap-5">
          <Thumb item={item} />
          <div className="min-w-0">
            <ItemName item={item} />
            <p className="mt-1 text-xs text-ink/70">
              Size: {item.size} · {item.brand}
            </p>
          </div>
        </div>

        {blocked ? <span /> : <QuantityControl item={item} />}

        <div className="text-right">
          {blocked ? (
            <p className="text-sm font-medium">{blockedMessage}</p>
          ) : (
            <>
              <p className="font-medium">{lineTotal}</p>
              {item.quantity > 1 && (
                <p className="text-xs text-ink/70">
                  {formatNaira(item.unitPrice)} each
                </p>
              )}
            </>
          )}
        </div>

        <RemoveButton item={item} />
      </div>
    </li>
  );
}

export default function CartView() {
  const items = useCartItems();
  const { checked, orderable, blocked } = useCheckedCart(items);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const tone = panelTones[PANEL_TONE];

  if (items.length === 0) {
    return (
      <div className="mt-10 border-y border-ink/15 py-16 text-center">
        <p className="font-serif text-2xl">Your cart is empty</p>
        <p className="mt-2 text-sm text-ink/70">
          Find a scent you love and add it here.
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

  // Items that can't be ordered are left out of the totals
  const subtotal = getCartSubtotal(orderable);
  const count = getCartCount(items);
  const orderableCount = getCartCount(orderable);
  const whatsappLink = buildWhatsAppLink(
    siteConfig.whatsappNumber,
    "Hello, I have a question about my cart.",
  );

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
      {/* The items sit directly on the page: no card, only thin lines */}
      <section aria-labelledby="cart-items-heading">
        <h2
          id="cart-items-heading"
          className="border-b border-ink/15 pb-3 font-serif text-2xl"
        >
          Your items <span className="text-ink/70">({count})</span>
        </h2>

        {blocked.length > 0 && (
          <div
            role="status"
            className="mt-4 border border-ink/30 bg-white/60 p-4 text-sm"
          >
            <p className="font-medium">
              {blocked.length === 1
                ? "One item in your cart can't be ordered right now."
                : `${blocked.length} items in your cart can't be ordered right now.`}
            </p>
            <p className="mt-1 text-ink/80">
              They are left out of your total. Remove them to continue to
              checkout.
            </p>
            <button
              type="button"
              onClick={() =>
                blocked.forEach((item) => removeItem(item.productId, item.size))
              }
              className="mt-3 h-11 border border-ink px-4 text-xs uppercase tracking-[0.15em] hover:bg-ink hover:text-cream"
            >
              Remove unavailable items
            </button>
          </div>
        )}

        {/* Column titles, from tablet size up */}
        <div
          aria-hidden="true"
          className={`hidden gap-x-4 border-b border-ink/10 py-3 text-[0.6875rem] uppercase tracking-[0.2em] text-ink/70 sm:grid ${tableColumns}`}
        >
          <span>Product</span>
          <span>Quantity</span>
          <span className="text-right">Price</span>
          <span />
        </div>

        <ul>
          {checked.map((item) => (
            <CartRow key={`${item.productId}-${item.size}`} item={item} />
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/shop"
            className="inline-flex h-11 items-center text-xs uppercase tracking-[0.15em] underline underline-offset-4"
          >
            ← Continue shopping
          </Link>

          {confirmingClear ? (
            <span className="flex flex-wrap items-center gap-3 text-sm">
              Remove everything?
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setConfirmingClear(false);
                }}
                className="h-11 border border-ink px-4 text-xs uppercase tracking-[0.15em] hover:bg-ink hover:text-cream"
              >
                Yes, clear
              </button>
              <button
                type="button"
                onClick={() => setConfirmingClear(false)}
                className="h-11 px-2 text-xs uppercase tracking-[0.15em] underline underline-offset-4"
              >
                Keep
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingClear(true)}
              className="h-11 text-xs uppercase tracking-[0.15em] underline underline-offset-4"
            >
              Clear cart
            </button>
          )}
        </div>
      </section>

      {/* The coloured panel on the right, with a thin gold line along the top */}
      <aside
        className={`h-fit border-t-2 border-gold p-6 lg:sticky lg:top-28 ${tone.panel}`}
        aria-label="Order summary"
      >
        <h2 className="font-serif text-xl">Order summary</h2>
        <div className={`mt-3 border-t ${tone.line}`} />

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className={tone.muted}>Items</dt>
            <dd>{orderableCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className={tone.muted}>Subtotal</dt>
            <dd className={tone.amount}>{formatNaira(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className={tone.muted}>Delivery</dt>
            <dd>At checkout</dd>
          </div>
          <div
            className={`flex items-baseline justify-between border-t pt-3 ${tone.line}`}
          >
            <dt className="font-medium">Total</dt>
            <dd className={`font-serif text-3xl ${tone.amount}`}>
              {formatNaira(subtotal)}
            </dd>
          </div>
        </dl>
        <p className={`mt-2 text-xs ${tone.muted}`}>
          The delivery fee is added at checkout, based on your area in Lagos.
        </p>

        {blocked.length > 0 ? (
          <>
            <span
              aria-disabled="true"
              className={`mt-6 flex h-12 cursor-not-allowed items-center justify-center text-xs font-medium uppercase tracking-[0.2em] ${tone.disabledButton}`}
            >
              Check out
            </span>
            <p className={`mt-2 text-xs ${tone.muted}`}>
              Remove the unavailable items to continue.
            </p>
          </>
        ) : (
          <Link
            href="/checkout"
            className={`mt-6 flex h-12 items-center justify-center text-xs font-medium uppercase tracking-[0.2em] transition ${tone.button}`}
          >
            Check out
          </Link>
        )}

        <div className={`mt-6 border-t pt-5 ${tone.line}`}>
          <h3 className="font-serif text-lg">Payment method</h3>
          {/* PLACEHOLDER wording: true of the shop today */}
          <p className="mt-3 flex items-start gap-3 text-sm">
            <Landmark
              className="mt-0.5 h-5 w-5 shrink-0"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span>
              <span className="block font-medium">Bank transfer</span>
              <span className={tone.muted}>
                Place your order, pay by transfer, then send us your proof on
                WhatsApp.
              </span>
            </span>
          </p>
          <p className={`mt-5 text-sm ${tone.muted}`}>
            Questions?{" "}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              Chat with us on WhatsApp
            </a>{" "}
            (opens WhatsApp).
          </p>
        </div>
      </aside>
    </div>
  );
}
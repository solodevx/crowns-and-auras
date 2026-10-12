import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function CartLink() {
  const count = 0; // TODO: read from cart state in the cart phase

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} items`}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink/5"
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-cream">
          {count}
        </span>
      )}
    </Link>
  );
}
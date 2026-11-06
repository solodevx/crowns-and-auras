import Link from "next/link";
import CartView from "@/components/store/CartView";

export const metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <nav aria-label="Breadcrumb" className="text-xs text-ink/70">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Cart</li>
        </ol>
      </nav>

      <header className="mt-10 text-center">
        <h1 className="font-serif text-3xl uppercase tracking-[0.4em] md:text-4xl">
          Shopping cart
        </h1>
        <span
          aria-hidden="true"
          className="mx-auto mt-4 block h-1.5 w-1.5 rounded-full bg-gold"
        />
      </header>

      <CartView />
    </section>
  );
}
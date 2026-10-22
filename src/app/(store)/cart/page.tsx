import CartView from "@/components/store/CartView";

export const metadata = { title: "Your cart", robots: { index: false } };

export default function CartPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-3xl">Your cart</h1>
      <CartView />
    </section>
  );
}
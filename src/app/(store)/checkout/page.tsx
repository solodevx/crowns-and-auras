import CheckoutForm from "@/components/store/CheckoutForm";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-3xl">Checkout</h1>
      <CheckoutForm />
    </section>
  );
}

import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Privacy notice",
  description: `How ${siteConfig.name} collects and uses your details when you order.`,
};

// Update the date below whenever the notice changes.
const LAST_UPDATED = "7 November 2026";

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 pb-16 pt-6">
      <nav aria-label="Breadcrumb" className="text-xs text-ink/70">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Privacy notice</li>
        </ol>
      </nav>

      <header className="mt-10 text-center">
        <h1 className="font-serif text-3xl uppercase tracking-[0.3em] md:text-4xl">
          Privacy notice
        </h1>
        <span
          aria-hidden="true"
          className="mx-auto mt-4 block h-1.5 w-1.5 rounded-full bg-gold"
        />
        <p className="mt-4 text-sm text-ink/70">Last updated {LAST_UPDATED}</p>
      </header>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-ink/90 md:text-base">
        <p>
          This notice explains what {siteConfig.name} does with your details
          when you order from this website. We keep it short and simple.
        </p>

        <section>
          <h2 className="font-serif text-xl text-ink">What we collect</h2>
          <p className="mt-2">When you place an order, we ask for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>your name and phone number</li>
            <li>your email address (optional)</li>
            <li>your delivery address and area</li>
            <li>any notes you add to your order</li>
          </ul>
          <p className="mt-2">
            We also keep a record of what you ordered and what it cost. While
            you shop, your cart is saved in your own browser until you order.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Why we use it</h2>
          <p className="mt-2">
            We use your details to process your order, confirm your payment,
            deliver your perfume, contact you about your order, and answer your
            questions. We do not sell your details, and we do not use them for
            advertising.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Who can see it</h2>
          <p className="mt-2">
            The people who run the shop can see your order details. We also use
            services that help run this website:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>a hosting service, to serve this website</li>
            <li>a database service, to store orders</li>
            <li>an image service, for product photos (not customer details)</li>
            <li>
              WhatsApp. If you message us there, WhatsApp handles that
              conversation. We may also get a WhatsApp alert when a new order
              arrives, which includes your name and the order total.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Payment</h2>
          <p className="mt-2">
            You pay by bank transfer to our account. We do not collect or store
            card details on this website.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Cookies and tracking</h2>
          <p className="mt-2">
            At the moment this shop does not use advertising or tracking
            cookies. Your cart is kept in your browser&rsquo;s storage, so it is
            still there if you come back.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">How long we keep it</h2>
          <p className="mt-2">
            We keep order records for as long as we need them to run the
            business and to answer questions about your order.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Your choices</h2>
          <p className="mt-2">
            You can ask us what details we hold about you, ask us to correct
            them, or ask us to delete them where we are allowed to. Message us
            on{" "}
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4"
            >
              WhatsApp
            </a>{" "}
            (opens WhatsApp) or email{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="underline underline-offset-4"
            >
              {siteConfig.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl text-ink">Changes</h2>
          <p className="mt-2">
            If we change this notice, we will update the date at the top.
          </p>
        </section>
      </div>
    </section>
  );
}
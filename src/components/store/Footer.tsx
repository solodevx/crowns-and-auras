import { Landmark, Mail, MessageCircle, Truck } from "lucide-react";
import { siteConfig } from "@/config/site";

async function getCurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

// PLACEHOLDER wording: only things that are true of the shop today
const promises = [
  {
    icon: Truck,
    title: "Delivery across Lagos",
    text: "Fee shown at checkout",
  },
  {
    icon: Landmark,
    title: "Pay by bank transfer",
    text: "Send your proof on WhatsApp",
  },
  { icon: MessageCircle, title: "Help on WhatsApp", text: "Ask us anything" },
];

// A small Instagram icon drawn here, because the icon pack has dropped brand logos
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

const socialClass =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 transition-colors hover:border-gold hover:text-gold";

export default async function Footer() {
  const year = await getCurrentYear();

  return (
    <footer id="contact" className="mt-16 bg-ink text-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="flex flex-col leading-none">
            <span className="font-serif text-4xl">{siteConfig.name}</span>
            <span className="mt-2 text-[0.5625rem] uppercase tracking-[0.45em]">
              Perfumes
            </span>
          </p>
          <p className="mt-5 text-sm text-cream/80">{siteConfig.description}</p>

          <ul className="mt-6 flex gap-3">
            <li>
              <a
                href={siteConfig.instagramUrl}
                aria-label="Instagram"
                className={socialClass}
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                aria-label="WhatsApp"
                className={socialClass}
              >
                <MessageCircle
                  className="h-5 w-5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                aria-label="Email"
                className={socialClass}
              >
                <Mail
                  className="h-5 w-5"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </a>
            </li>
          </ul>
        </div>

        <ul className="space-y-6 md:border-l md:border-cream/20 md:pl-10">
          {promises.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-4">
              <Icon
                className="h-7 w-7 shrink-0 text-gold"
                strokeWidth={1.25}
                aria-hidden="true"
              />
              <span>
                <span className="block text-xs font-medium uppercase tracking-[0.18em]">
                  {title}
                </span>
                <span className="block text-sm text-cream/75">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-cream/15">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-cream/70">
          © {year} {siteConfig.name}. All rights reserved. Placeholder content.
        </p>
      </div>
    </footer>
  );
}
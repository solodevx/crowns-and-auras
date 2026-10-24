import Link from "next/link";
import { siteConfig } from "@/config/site";
import CartLink from "./CartLink";
import MobileMenu from "./MobileMenu";

// Only pages that exist today
const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Scents", href: "/#scents" },
  { label: "Contact", href: "#contact" },
];
const mobileLinks = [...navLinks, { label: "Search", href: "/shop" }];

const navLinkClass =
  "inline-flex h-11 items-center text-xs uppercase tracking-[0.2em] hover:text-accent";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/40 bg-cream/90 backdrop-blur">
      <div className="relative mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <div className="flex items-center">
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
          </nav>
          <MobileMenu links={mobileLinks} />
        </div>

        <Link
          href="/"
          className="font-serif text-base uppercase tracking-[0.2em] sm:text-xl sm:tracking-[0.3em]"
        >
          {siteConfig.name}
        </Link>

        <div className="flex items-center justify-end gap-6">
          <Link
            href="/shop"
            className={`${navLinkClass} hidden sm:inline-flex`}
          >
            Search
          </Link>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
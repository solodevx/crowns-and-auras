import Link from "next/link";
import { Search } from "lucide-react";
import { siteConfig } from "@/config/site";
import CartLink from "./CartLink";
import MobileMenu from "./MobileMenu";

// Only pages and sections that exist today
const leftLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Scents", href: "/#scents" },
  { label: "Brands", href: "/brands" },
  { label: "About", href: "/#about" },
];
const rightLinks = [{ label: "Contact", href: "#contact" }];
const mobileLinks = [
  ...leftLinks,
  ...rightLinks,
];

const navLinkClass =
  "inline-flex h-11 items-center text-xs uppercase tracking-[0.2em] hover:text-accent";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/40 bg-cream/90 backdrop-blur">
      <div className="relative mx-auto grid h-20 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <div className="flex items-center">
          <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
            {leftLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
          </nav>
          <MobileMenu links={mobileLinks} />
        </div>

        <Link href="/" className="flex flex-col items-center leading-none">
          <span className="font-serif text-3xl sm:text-4xl">
            {siteConfig.name}
          </span>
          <span className="mt-1 text-[0.5625rem] uppercase tracking-[0.45em]">
            Perfumes
          </span>
        </Link>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <nav aria-label="Secondary" className="mr-4 hidden md:block">
            {rightLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/shop"
            aria-label="Search the shop"
            className="inline-flex h-11 w-11 items-center justify-center hover:text-accent"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          <CartLink />
        </div>
      </div>
    </header>
  );
}
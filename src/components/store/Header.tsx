import Link from "next/link";
import { siteConfig } from "@/config/site";
import MobileMenu from "./MobileMenu";
import CartLink from "./CartLink";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-serif text-xl tracking-wide">
          {siteConfig.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm hover:text-accent">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <CartLink />
          <MobileMenu links={siteConfig.nav} />
        </div>
      </div>
    </header>
  );
}
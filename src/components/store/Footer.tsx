import { siteConfig } from "@/config/site";

// CHANGE 1: new helper. "use cache" tells Next.js to work out the year once and remember it.
async function getCurrentYear() {
  "use cache";
  return new Date().getFullYear();
}

// CHANGE 2: added "async" so we can use "await" inside
export default async function Footer() {
  const year = await getCurrentYear(); // CHANGE 2: ask the helper for the year

  return (
    <footer id="contact" className="mt-16 border-t border-ink/10">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="font-serif text-xl">{siteConfig.name}</p>
        <p className="mt-2 max-w-md text-sm text-ink/70">{siteConfig.description}</p>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li>
            <a href={`https://wa.me/${siteConfig.whatsappNumber}`} className="hover:text-accent">
              WhatsApp
            </a>
          </li>
          <li>
            <a href={siteConfig.instagramUrl} className="hover:text-accent">
              Instagram
            </a>
          </li>
          <li>
            <a href={`mailto:${siteConfig.email}`} className="hover:text-accent">
              Email
            </a>
          </li>
        </ul>

        <p className="mt-8 text-xs text-ink/50">
          © {year} {siteConfig.name}. Placeholder content. {/* CHANGE 3: {year} instead of new Date()... */}
        </p>
      </div>
    </footer>
  );
}
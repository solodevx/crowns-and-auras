import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Landmark, Truck } from "lucide-react";
import ProductGallery from "@/components/store/ProductGallery";
import ProductNotes from "@/components/store/ProductNotes";
import SizePicker from "@/components/store/SizePicker";
import { getScentName } from "@/config/scents";
import { siteConfig } from "@/config/site";
import { formatNaira } from "@/lib/format";
import { optimizedImageUrl } from "@/lib/image-url";
import { isProductAvailable } from "@/lib/product";
import { getCurrentSlugForOldAddress, getProductBySlug } from "@/lib/products";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Perfume not found", robots: { index: false } };
  }

  const title = `${product.brand} ${product.name}`;
  const description = (
    product.description ||
    `${title} from ${siteConfig.name}. Delivery across Lagos.`
  ).slice(0, 160);
  const image = product.images[0]
    ? optimizedImageUrl(product.images[0], 1200, 630)
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title,
      description,
      url: `/shop/${product.slug}`,
      images: image ? [image] : undefined,
    },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <Suspense fallback={<p className="text-ink/70">Loading perfume…</p>}>
        <ProductDetails params={params} />
      </Suspense>
    </section>
  );
}

async function ProductDetails({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    // An old address? Send the visitor to the perfume's current address.
    const currentSlug = await getCurrentSlugForOldAddress(slug);
    if (currentSlug && currentSlug !== slug) {
      permanentRedirect(`/shop/${currentSlug}`);
    }
    notFound();
  }

  const prices = product.variants.map((variant) => variant.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const priceText =
    low === high
      ? formatNaira(low)
      : `${formatNaira(low)} - ${formatNaira(high)}`;
  const available = isProductAvailable(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description || undefined,
    image: product.images.length > 0 ? product.images : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "NGN",
      lowPrice: low,
      highPrice: high,
      offerCount: prices.length,
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      {/* "<" is escaped so nothing typed in a description can break out of the script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <nav aria-label="Breadcrumb" className="text-xs text-ink/70">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href="/shop" className="hover:underline">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 md:grid-cols-2 lg:gap-16">
        <div className="md:sticky md:top-28 md:self-start">
          <ProductGallery
            images={product.images}
            label={`${product.brand} ${product.name}`}
            badge={available ? undefined : "Unavailable"}
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-ink/70">
            {product.brand}
          </p>
          <h1 className="mt-2 font-serif text-3xl uppercase tracking-wide md:text-4xl">
            {product.name}
          </h1>
          {product.scentFamilies.length > 0 && (
            <p className="mt-2 text-sm uppercase italic tracking-wider text-ink/60">
              {product.scentFamilies.map(getScentName).join(" · ")}
            </p>
          )}

          <p className="mt-6 text-xl">{priceText}</p>

          {product.description && (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink/80">
              {product.description}
            </p>
          )}

          <ProductNotes notes={product.notes} />

          {/* PLACEHOLDER wording: only things that are true of the shop today */}
          <div className="mt-8 space-y-3 border border-ink/15 bg-white/50 p-4 text-sm">
            <p className="flex items-start gap-3">
              <Truck
                className="mt-0.5 h-5 w-5 shrink-0"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>
                Delivery across Lagos. The fee depends on your area and is shown
                at checkout.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <Landmark
                className="mt-0.5 h-5 w-5 shrink-0"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              <span>
                Pay by bank transfer, then send us your proof on WhatsApp.
              </span>
            </p>
          </div>

          <SizePicker product={product} />
        </div>
      </div>
    </>
  );
}
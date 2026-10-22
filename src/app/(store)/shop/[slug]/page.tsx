import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/store/ProductGallery";
import SizePicker from "@/components/store/SizePicker";
import { siteConfig } from "@/config/site";
import { optimizedImageUrl } from "@/lib/image-url";
import { getProductBySlug } from "@/lib/products";

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
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Suspense fallback={<p className="text-ink/70">Loading perfume…</p>}>
        <ProductDetails params={params} />
      </Suspense>
    </section>
  );
}

async function ProductDetails({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const prices = product.variants.map((variant) => variant.price);
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
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: product.variants.some((variant) => variant.available)
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
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery
          images={product.images}
          label={`${product.brand} ${product.name}`}
        />
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/70">
            {product.brand}
          </p>
          <h1 className="font-serif text-3xl">{product.name}</h1>
          <p className="mt-4 max-w-xl text-ink/70">{product.description}</p>
          <SizePicker product={product} />
        </div>
      </div>
    </>
  );
}
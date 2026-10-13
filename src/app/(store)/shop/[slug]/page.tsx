import { Suspense } from "react";
import { notFound } from "next/navigation";
import { placeholderProducts } from "@/data/placeholder-products";
import { getProductBySlug } from "@/lib/product";

export function generateStaticParams() {
  return placeholderProducts.map((product) => ({ slug: product.slug }));
}

type ProductPageProps = { params: Promise<{ slug: string }> };

// The page frame. It does NOT open the params, it just passes them down.
export default function ProductPage({ params }: ProductPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Suspense fallback={<p className="text-ink/60">Loading perfume…</p>}>
        <ProductDetails params={params} />
      </Suspense>
    </section>
  );
}

// The part that needs the address. It opens the params inside Suspense.
async function ProductDetails({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return (
    <>
      <p className="text-xs uppercase tracking-widest text-ink/60">
        {product.brand}
      </p>
      <h1 className="font-serif text-3xl">{product.name}</h1>
      <p className="mt-4 max-w-xl text-ink/70">{product.description}</p>
    </>
  );
}
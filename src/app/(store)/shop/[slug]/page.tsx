import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/store/ProductGallery";
import SizePicker from "@/components/store/SizePicker";
import { getProductBySlug } from "@/lib/products";

type ProductPageProps = { params: Promise<{ slug: string }> };

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <Suspense fallback={<p className="text-ink/60">Loading perfume…</p>}>
        <ProductDetails params={params} />
      </Suspense>
    </section>
  );
}

async function ProductDetails({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductGallery
        images={product.images}
        label={`${product.brand} ${product.name}`}
      />
      <div>
        <p className="text-xs uppercase tracking-widest text-ink/60">
          {product.brand}
        </p>
        <h1 className="font-serif text-3xl">{product.name}</h1>
        <p className="mt-4 max-w-xl text-ink/70">{product.description}</p>
        <SizePicker product={product} />
      </div>
    </div>
  );
}
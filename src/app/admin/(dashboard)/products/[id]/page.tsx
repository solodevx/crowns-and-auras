import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import ProductForm, {
  type ProductFormValues,
} from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProductForEdit } from "@/lib/admin-products";
import { updateProductAction } from "../actions";

export const metadata = { title: "Edit product" };

type EditProductPageProps = { params: Promise<{ id: string }> };

export default function EditProductPage({ params }: EditProductPageProps) {
  return (
    <>
      <Link href="/admin/products" className="text-sm underline">
        Back to products
      </Link>
      <Suspense fallback={<p className="mt-6 text-ink/60">Loading product…</p>}>
        <EditProductContent params={params} />
      </Suspense>
    </>
  );
}

async function EditProductContent({ params }: EditProductPageProps) {
  await requireAdmin();
  const { id } = await params;
  const product = await getAdminProductForEdit(id);

  if (!product) notFound();

  const initialValues: ProductFormValues = {
    brand: product.brand,
    name: product.name,
    description: product.description,
    scentFamilies: product.scentFamilies,
    images: product.images,
    variants: product.variants.map((variant) => ({
      size: variant.size,
      price: String(variant.price),
      available: variant.available,
    })),
    featured: product.featured,
    isActive: product.isActive,
  };

  return (
    <>
      <h1 className="mt-4 font-serif text-3xl">Edit {product.name}</h1>
      <p className="mt-1 text-sm text-ink/60">
        Shop address: /shop/{product.slug}
      </p>

      <ProductForm
        key={product.id}
        submitAction={updateProductAction.bind(null, product.id)}
        submitLabel="Save changes"
        initialValues={initialValues}
      />

      <section className="mt-10 max-w-2xl border-t border-ink/10 pt-6">
        <h2 className="font-serif text-xl">Delete</h2>
        <p className="mt-2 text-sm text-ink/70">
          Removes this perfume for good. Past orders keep their own copy of the
          details. To just take it off the shop for now, untick &ldquo;Visible
          in the shop&rdquo; above instead.
        </p>
        <div className="mt-4">
          <DeleteProductButton
            productId={product.id}
            productName={product.name}
          />
        </div>
      </section>
    </>
  );
}
import { Suspense } from "react";
import Link from "next/link";
import ProductVisibilityButton from "@/components/admin/ProductVisibilityButton";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminProducts } from "@/lib/admin-products";
import { formatNaira } from "@/lib/format";

export const metadata = { title: "Products" };

export default function AdminProductsPage() {
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-3xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center rounded bg-ink px-5 text-sm text-cream"
        >
          Add product
        </Link>
      </div>
      <Suspense fallback={<p className="mt-6 text-ink/60">Loading products…</p>}>
        <ProductsContent />
      </Suspense>
    </>
  );
}

async function ProductsContent() {
  await requireAdmin();
  const products = await getAdminProducts();

  if (products.length === 0) {
    return <p className="mt-8 text-ink/70">No products yet.</p>;
  }

  return (
    <ul className="mt-6 divide-y divide-ink/10 rounded-lg border border-ink/10">
      {products.map((product) => (
        <li
          key={product.id}
          className={`flex flex-wrap items-center justify-between gap-3 p-4 ${
            product.isActive ? "" : "bg-ink/5 text-ink/60"
          }`}
        >
          <div>
            <p className="text-xs uppercase tracking-widest">{product.brand}</p>
            <p className="font-serif text-lg">{product.name}</p>
            <p className="mt-1 text-sm">
              {product.sizes
                .map(
                  (size) =>
                    `${size.size} ${formatNaira(size.price)}${
                      size.available ? "" : " (unavailable)"
                    }`,
                )
                .join(" · ")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2 text-xs">
              <span
                className={`rounded px-2 py-1 ${
                  product.isActive
                    ? "bg-green-100 text-green-900"
                    : "bg-ink/10"
                }`}
              >
                {product.isActive ? "Visible" : "Hidden"}
              </span>
              {product.featured && (
                <span className="rounded bg-ink/10 px-2 py-1">Featured</span>
              )}
            </div>
            <Link
              href={`/admin/products/${product.id}`}
              className="inline-flex h-11 items-center text-sm underline"
            >
              Edit
            </Link>
            <ProductVisibilityButton
              productId={product.id}
              isActive={product.isActive}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
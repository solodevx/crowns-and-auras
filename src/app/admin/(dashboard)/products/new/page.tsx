import { Suspense } from "react";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getBrandOptionsForForm } from "@/lib/admin-products";
import {
  featuredFullMessage,
  getFeaturedCountForPage,
  HOMEPAGE_FEATURED_LIMIT,
} from "@/lib/featured-limit";
import { createProductAction } from "./actions";

export const metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/products" className="text-sm underline">
        Back to products
      </Link>
      <h1 className="mt-4 font-serif text-3xl">Add product</h1>
      <Suspense fallback={<p className="mt-6 text-ink/70">Loading…</p>}>
        <NewProductContent />
      </Suspense>
    </>
  );
}

async function NewProductContent() {
  await requireAdmin();
  const [featuredCount, brands] = await Promise.all([
    getFeaturedCountForPage(),
    getBrandOptionsForForm(),
  ]);

  return (
    <ProductForm
      submitAction={createProductAction}
      submitLabel="Add product"
      brands={brands}
      featuredFull={featuredCount >= HOMEPAGE_FEATURED_LIMIT}
      featuredMessage={featuredFullMessage}
    />
  );
}
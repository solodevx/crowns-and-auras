import { Suspense } from "react";
import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin-auth";
import { createProductAction } from "./actions";

export const metadata = { title: "Add product" };

export default function NewProductPage() {
  return (
    <>
      <Link href="/admin/products" className="text-sm underline">
        Back to products
      </Link>
      <h1 className="mt-4 font-serif text-3xl">Add product</h1>
      <Suspense fallback={<p className="mt-6 text-ink/60">Loading…</p>}>
        <NewProductContent />
      </Suspense>
    </>
  );
}

async function NewProductContent() {
  await requireAdmin();
  return (
    <ProductForm submitAction={createProductAction} submitLabel="Add product" />
  );
}
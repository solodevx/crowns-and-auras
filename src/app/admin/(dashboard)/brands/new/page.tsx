import { Suspense } from "react";
import Link from "next/link";
import BrandForm from "@/components/admin/BrandForm";
import { requireAdmin } from "@/lib/admin-auth";
import { createBrandAction } from "../actions";

export const metadata = { title: "Add brand" };

export default function NewBrandPage() {
  return (
    <>
      <Link href="/admin/brands" className="text-sm underline">
        Back to brands
      </Link>
      <h1 className="mt-4 font-serif text-3xl">Add brand</h1>
      <Suspense fallback={<p className="mt-6 text-ink/70">Loading…</p>}>
        <NewBrandContent />
      </Suspense>
    </>
  );
}

async function NewBrandContent() {
  await requireAdmin();
  return <BrandForm submitAction={createBrandAction} submitLabel="Add brand" />;
}
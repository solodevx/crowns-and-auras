import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BrandForm, { type BrandFormValues } from "@/components/admin/BrandForm";
import DeleteBrandButton from "@/components/admin/DeleteBrandButton";
import { requireAdmin } from "@/lib/admin-auth";
import { getAdminBrandForEdit } from "@/lib/admin-brands";
import { updateBrandAction } from "../actions";

export const metadata = { title: "Edit brand" };

type EditBrandPageProps = { params: Promise<{ id: string }> };

export default function EditBrandPage({ params }: EditBrandPageProps) {
  return (
    <>
      <Link href="/admin/brands" className="text-sm underline">
        Back to brands
      </Link>
      <Suspense fallback={<p className="mt-6 text-ink/70">Loading brand…</p>}>
        <EditBrandContent params={params} />
      </Suspense>
    </>
  );
}

async function EditBrandContent({ params }: EditBrandPageProps) {
  await requireAdmin();
  const { id } = await params;
  const brand = await getAdminBrandForEdit(id);

  if (!brand) notFound();

  const initialValues: BrandFormValues = {
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    imageUrl: brand.imageUrl,
    displayOrder: String(brand.displayOrder),
    isActive: brand.isActive,
    isFeatured: brand.isFeatured,
  };

  return (
    <>
      <h1 className="mt-4 font-serif text-3xl">Edit {brand.name}</h1>
      <p className="mt-1 text-sm text-ink/70">
        {brand.productCount} product{brand.productCount === 1 ? "" : "s"} use
        this brand.
      </p>

      <BrandForm
        key={brand.id}
        submitAction={updateBrandAction.bind(null, brand.id)}
        submitLabel="Save changes"
        initialValues={initialValues}
        isEditing
      />

      <section className="mt-10 max-w-2xl border-t border-ink/10 pt-6">
        <h2 className="font-serif text-xl">Delete</h2>
        <p className="mt-2 text-sm text-ink/70">
          Removes this brand for good. To just take it off the website for now,
          untick &ldquo;Active&rdquo; above instead.
        </p>
        <div className="mt-4">
          <DeleteBrandButton
            brandId={brand.id}
            brandName={brand.name}
            productCount={brand.productCount}
          />
        </div>
      </section>
    </>
  );
}
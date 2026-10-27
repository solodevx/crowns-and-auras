"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import { brandInputSchema, type BrandFormResult } from "@/lib/brand-validators";
import { slugify } from "@/lib/slug";

export type BrandFormValues = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: string;
  isActive: boolean;
  isFeatured: boolean;
};

type BrandFormProps = {
  submitAction: (payload: unknown) => Promise<BrandFormResult>;
  submitLabel: string;
  initialValues?: BrandFormValues;
  isEditing?: boolean;
};

const blankValues: BrandFormValues = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  displayOrder: "0",
  isActive: true,
  isFeatured: false,
};

const inputClassName =
  "mt-1 h-11 w-full rounded border border-ink/20 bg-white px-3";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
      {message}
    </p>
  );
}

export default function BrandForm({
  submitAction,
  submitLabel,
  initialValues = blankValues,
  isEditing = false,
}: BrandFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<BrandFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, startNavigation] = useTransition();
  // The address follows the name, until someone edits the address by hand.
  // An existing brand whose address was already customised never follows.
  const [slugTouched, setSlugTouched] = useState(
    isEditing ? initialValues.slug !== slugify(initialValues.name) : false,
  );
  const isBusy = isSubmitting || isNavigating;
  const slugChanged = isEditing && values.slug !== initialValues.slug;

  function setField<Key extends keyof BrandFormValues>(
    key: Key,
    value: BrandFormValues[Key],
  ) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
  }

  function changeName(name: string) {
    setValues((previous) => ({
      ...previous,
      name,
      ...(slugTouched ? {} : { slug: slugify(name) }),
    }));
    setErrors((previous) => ({ ...previous, name: "", slug: "" }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;
    setFormError("");

    const candidate = {
      ...values,
      displayOrder: Number(values.displayOrder) || 0,
    };

    // First check, in the browser, for quick friendly messages
    const result = brandInputSchema.safeParse(candidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "form");
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      setFormError("Please check the highlighted fields.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await submitAction(result.data);
      if (response.ok) {
        startNavigation(() => {
          router.push(
            `/admin/brands?saved=${isEditing ? "updated" : "created"}`,
          );
          router.refresh();
        });
        setIsSubmitting(false);
        return;
      }
      if (response.fieldErrors) setErrors(response.fieldErrors);
      setFormError(response.message);
    } catch {
      setFormError("Could not reach the server. Try again.");
    }

    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-6 max-w-2xl space-y-6"
    >
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Brand name
        </label>
        <input
          id="name"
          value={values.name}
          onChange={(event) => changeName(event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={inputClassName}
        />
        <FieldError id="name" message={errors.name} />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium">
          Web address
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-ink/70">/brands/</span>
          <input
            id="slug"
            value={values.slug}
            onChange={(event) => {
              setSlugTouched(true);
              setField("slug", event.target.value);
            }}
            aria-invalid={errors.slug ? true : undefined}
            aria-describedby={errors.slug ? "slug-error" : "slug-help"}
            className="h-11 w-full rounded border border-ink/20 bg-white px-3"
          />
        </div>
        <p id="slug-help" className="mt-1 text-xs text-ink/70">
          {slugChanged
            ? `The web address will change from /brands/${initialValues.slug} to /brands/${values.slug}. Old links will redirect to the new one.`
            : isEditing
              ? "Follows the name unless you edit it yourself."
              : "Made from the name. Edit it if you want a different address."}
        </p>
        <FieldError id="slug" message={errors.slug} />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Short description{" "}
          <span className="font-normal text-ink/70">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(event) => setField("description", event.target.value)}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
          className="mt-1 w-full rounded border border-ink/20 bg-white px-3 py-2"
        />
        <FieldError id="description" message={errors.description} />
      </div>

      <ImageUploader
        images={values.imageUrl ? [values.imageUrl] : []}
        onChange={(images) => setField("imageUrl", images[0] ?? "")}
        error={errors.imageUrl}
        max={1}
        legend="Brand image or logo"
        itemLabel="Brand image"
      />

      <div>
        <label htmlFor="displayOrder" className="block text-sm font-medium">
          Display order
        </label>
        <input
          id="displayOrder"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={values.displayOrder}
          onChange={(event) => setField("displayOrder", event.target.value)}
          aria-invalid={errors.displayOrder ? true : undefined}
          aria-describedby={
            errors.displayOrder ? "displayOrder-error" : "order-help"
          }
          className="mt-1 h-11 w-32 rounded border border-ink/20 bg-white px-3"
        />
        <p id="order-help" className="mt-1 text-xs text-ink/70">
          Lower numbers come first.
        </p>
        <FieldError id="displayOrder" message={errors.displayOrder} />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(event) => setField("isActive", event.target.checked)}
          />
          Active (shown on the website)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isFeatured}
            onChange={(event) => setField("isFeatured", event.target.checked)}
          />
          Featured on the homepage
        </label>
        <FieldError id="isFeatured" message={errors.isFeatured} />
      </div>

      <div>
        <button
          type="submit"
          disabled={isBusy}
          className="h-12 min-w-44 rounded bg-ink px-8 text-sm text-cream disabled:opacity-60"
        >
          {isBusy ? "Saving..." : submitLabel}
        </button>
        <p role="alert" className="mt-3 min-h-5 text-sm text-red-700">
          {formError}
        </p>
      </div>
    </form>
  );
}
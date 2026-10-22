"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import { scentFamilies } from "@/config/scents";
import {
  productInputSchema,
  type ProductFormResult,
} from "@/lib/product-validators";

type VariantValue = { size: string; price: string; available: boolean };

export type ProductFormValues = {
  brand: string;
  name: string;
  description: string;
  images: string[];
  scentFamilies: string[];
  variants: VariantValue[];
  featured: boolean;
  isActive: boolean;
};

type ProductFormProps = {
  submitAction: (payload: unknown) => Promise<ProductFormResult>;
  submitLabel: string;
  initialValues?: ProductFormValues;
};

const blankValues: ProductFormValues = {
  brand: "",
  name: "",
  description: "",
  images: [],
  scentFamilies: [],
  variants: [{ size: "", price: "", available: true }],
  featured: false,
  isActive: true,
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

export default function ProductForm({
  submitAction,
  submitLabel,
  initialValues = blankValues,
}: ProductFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigating, startNavigation] = useTransition();

  function setField<Key extends keyof ProductFormValues>(
    key: Key,
    value: ProductFormValues[Key],
  ) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: "" }));
  }

  function toggleScent(scent: string) {
    const next = values.scentFamilies.includes(scent)
      ? values.scentFamilies.filter((item) => item !== scent)
      : [...values.scentFamilies, scent];
    setField("scentFamilies", next);
  }

  function updateVariant(index: number, changes: Partial<VariantValue>) {
    setField(
      "variants",
      values.variants.map((variant, position) =>
        position === index ? { ...variant, ...changes } : variant,
      ),
    );
  }

  function addVariant() {
    if (values.variants.length >= 8) return;
    setField("variants", [
      ...values.variants,
      { size: "", price: "", available: true },
    ]);
  }

  function removeVariant(index: number) {
    if (values.variants.length <= 1) return;
    setField(
      "variants",
      values.variants.filter((_, position) => position !== index),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setFormError("");

    // Prices are typed as text, so turn them into numbers before checking
    const candidate = {
      ...values,
      variants: values.variants.map((variant) => ({
        size: variant.size,
        price: Number(variant.price) || 0,
        available: variant.available,
      })),
    };

    // First check, in the browser, for quick friendly messages
    const result = productInputSchema.safeParse(candidate);
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
          router.push("/admin/products");
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
        <label htmlFor="brand" className="block text-sm font-medium">
          Brand
        </label>
        <input
          id="brand"
          value={values.brand}
          onChange={(event) => setField("brand", event.target.value)}
          aria-invalid={errors.brand ? true : undefined}
          aria-describedby={errors.brand ? "brand-error" : undefined}
          className={inputClassName}
        />
        <FieldError id="brand" message={errors.brand} />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Perfume name
        </label>
        <input
          id="name"
          value={values.name}
          onChange={(event) => setField("name", event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={inputClassName}
        />
        <FieldError id="name" message={errors.name} />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description{" "}
          <span className="font-normal text-ink/70">(optional)</span>
        </label>
        <textarea
          id="description"
          rows={4}
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
        images={values.images}
        onChange={(images) => setField("images", images)}
        error={errors.images}
      />

      <fieldset>
        <legend className="text-sm font-medium">Scent families</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {scentFamilies.map((scent) => (
            <label
              key={scent}
              className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-ink/20 px-4 text-sm has-checked:border-ink has-checked:bg-ink has-checked:text-cream"
            >
              <input
                type="checkbox"
                checked={values.scentFamilies.includes(scent)}
                onChange={() => toggleScent(scent)}
              />
              {scent}
            </label>
          ))}
        </div>
        <FieldError id="scentFamilies" message={errors.scentFamilies} />
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Sizes and prices</legend>
        <div className="mt-2 space-y-3">
          {values.variants.map((variant, index) => (
            <div
              key={index}
              className="flex flex-wrap items-end gap-3 rounded-lg border border-ink/10 p-3"
            >
              <div className="w-28">
                <label
                  htmlFor={`size-${index}`}
                  className="block text-xs font-medium"
                >
                  Size
                </label>
                <input
                  id={`size-${index}`}
                  value={variant.size}
                  placeholder="50ml"
                  onChange={(event) =>
                    updateVariant(index, { size: event.target.value })
                  }
                  className={inputClassName}
                />
              </div>

              <div className="w-36">
                <label
                  htmlFor={`price-${index}`}
                  className="block text-xs font-medium"
                >
                  Price (₦)
                </label>
                <input
                  id={`price-${index}`}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={variant.price}
                  placeholder="45000"
                  onChange={(event) =>
                    updateVariant(index, { price: event.target.value })
                  }
                  className={inputClassName}
                />
              </div>

              <label className="flex h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={variant.available}
                  onChange={(event) =>
                    updateVariant(index, { available: event.target.checked })
                  }
                />
                Available
              </label>

              <button
                type="button"
                onClick={() => removeVariant(index)}
                disabled={values.variants.length <= 1}
                className="h-11 px-2 text-sm underline disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <FieldError id="variants" message={errors.variants} />
        <button
          type="button"
          onClick={addVariant}
          disabled={values.variants.length >= 8}
          className="mt-3 h-11 text-sm underline disabled:opacity-40"
        >
          Add another size
        </button>
      </fieldset>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(event) => setField("isActive", event.target.checked)}
          />
          Visible in the shop
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.featured}
            onChange={(event) => setField("featured", event.target.checked)}
          />
          Show on the homepage (featured)
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting || isNavigating}
          className="h-12 min-w-44 rounded bg-ink px-8 text-sm text-cream disabled:opacity-60"
        >
          {isSubmitting || isNavigating ? "Saving..." : submitLabel}
        </button>
        <p role="alert" className="mt-3 min-h-5 text-sm text-red-700">
          {formError}
        </p>
      </div>
    </form>
  );
}
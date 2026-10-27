"use client";

import { useState, useTransition } from "react";
import { toggleBrandAction } from "@/app/admin/(dashboard)/brands/actions";

type BrandToggleButtonProps = {
  brandId: string;
  field: "isActive" | "isFeatured";
  nextValue: boolean;
  label: string;
  describedBy: string;
  disabled?: boolean;
  hint?: string;
};

export default function BrandToggleButton({
  brandId,
  field,
  nextValue,
  label,
  describedBy,
  disabled = false,
  hint,
}: BrandToggleButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function toggle() {
    setMessage("");
    startTransition(async () => {
      const result = await toggleBrandAction({
        brandId,
        field,
        value: nextValue,
      });
      if (!result.ok) setMessage(result.message);
    });
  }

  return (
    <div className="max-w-44">
      <button
        type="button"
        onClick={toggle}
        disabled={isPending || disabled}
        aria-label={`${label} ${describedBy}`}
        className="h-11 min-w-24 text-left text-sm underline disabled:no-underline disabled:opacity-50"
      >
        {isPending ? "Saving…" : label}
      </button>
      {disabled && hint && <p className="text-xs text-ink/70">{hint}</p>}
      {message && (
        <p role="alert" className="text-xs text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}
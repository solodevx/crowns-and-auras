"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBrandAction } from "@/app/admin/(dashboard)/brands/actions";

type DeleteBrandButtonProps = {
  brandId: string;
  brandName: string;
  productCount: number;
};

export default function DeleteBrandButton({
  brandId,
  brandName,
  productCount,
}: DeleteBrandButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const blocked = productCount > 0;

  function handleDelete() {
    const sure = window.confirm(
      `Delete "${brandName}" permanently? This cannot be undone.`,
    );
    if (!sure) return;

    setMessage("");
    startTransition(async () => {
      const result = await deleteBrandAction({ brandId });
      if (result.ok) {
        router.push("/admin/brands?saved=deleted");
        router.refresh();
      } else {
        setMessage(result.message);
      }
    });
  }

  return (
    <div>
      {blocked && (
        <p className="mb-3 text-sm text-ink/80">
          This brand still has {productCount} product
          {productCount === 1 ? "" : "s"}. Move or delete them first, or
          deactivate the brand instead.
        </p>
      )}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending || blocked}
        className="h-11 min-w-40 rounded border border-red-700 px-5 text-sm text-red-700 disabled:opacity-50"
      >
        {isPending ? "Deleting…" : "Delete brand"}
      </button>
      {message && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}
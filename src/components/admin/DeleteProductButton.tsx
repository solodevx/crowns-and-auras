"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProductAction } from "@/app/admin/(dashboard)/products/actions";

type DeleteProductButtonProps = { productId: string; productName: string };

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function handleDelete() {
    const sure = window.confirm(
      `Delete "${productName}" permanently? This cannot be undone. (Hiding it instead keeps it safe.)`,
    );
    if (!sure) return;

    setMessage("");
    startTransition(async () => {
      const result = await deleteProductAction({ productId });
      if (result.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setMessage(result.message);
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="h-11 rounded border border-red-700 px-5 text-sm text-red-700 disabled:opacity-60"
      >
        {isPending ? "Deleting…" : "Delete product"}
      </button>
      {message && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}
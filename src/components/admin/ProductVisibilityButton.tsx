"use client";

import { useState, useTransition } from "react";
import { setProductVisibilityAction } from "@/app/admin/(dashboard)/products/actions";

type ProductVisibilityButtonProps = { productId: string; isActive: boolean };

export default function ProductVisibilityButton({
  productId,
  isActive,
}: ProductVisibilityButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function toggle() {
    setMessage("");
    startTransition(async () => {
      const result = await setProductVisibilityAction({
        productId,
        isActive: !isActive,
      });
      if (!result.ok) setMessage(result.message);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        className="h-11 min-w-16 text-left text-sm underline disabled:opacity-60"
      >
        {isPending ? "Saving…" : isActive ? "Hide" : "Show"}
      </button>
      {message && (
        <p role="alert" className="text-xs text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}
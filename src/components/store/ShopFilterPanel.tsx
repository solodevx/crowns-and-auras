"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";

// On phones the filters fold behind a button. On large screens they are always shown.
export default function ShopFilterPanel({
  children,
  activeCount,
}: {
  children: ReactNode;
  activeCount: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="shop-filters"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between border border-ink/15 bg-white/50 px-4 text-xs uppercase tracking-[0.2em] lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </span>
        <span>{open ? "Hide" : "Show"}</span>
      </button>
      <div
        id="shop-filters"
        className={`${open ? "mt-3 block" : "hidden"} lg:mt-0 lg:block`}
      >
        {children}
      </div>
    </div>
  );
}
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  DEFAULT_SORT,
  SORT_OPTIONS,
  type SortValue,
} from "@/lib/filter-products";

export default function SortSelect({ value }: { value: SortValue }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function change(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === DEFAULT_SORT) params.delete("sort");
    else params.set("sort", next);
    params.delete("page"); // a new order starts on page 1
    const query = params.toString();
    router.push(query ? `/shop?${query}` : "/shop");
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-xs uppercase tracking-[0.2em]">
        Sort by
      </label>
      <select
        id="sort"
        value={value}
        onChange={(event) => change(event.target.value)}
        className="h-10 border border-ink/15 bg-white/60 px-3 text-sm"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
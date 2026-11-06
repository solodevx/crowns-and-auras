import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductFilters } from "@/lib/filter-products";
import { buildShopHref } from "@/lib/shop-url";

type PaginationProps = {
  filters: ProductFilters;
  page: number;
  totalPages: number;
};

// 1, then the pages around the current one, then the last, with "…" between gaps
function pageList(current: number, total: number): (number | "gap")[] {
  const wanted = [1, current - 1, current, current + 1, total].filter(
    (page) => page >= 1 && page <= total,
  );
  const pages = [...new Set(wanted)].sort((first, second) => first - second);
  const list: (number | "gap")[] = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) list.push("gap");
    list.push(page);
  });
  return list;
}

const itemClass =
  "inline-flex h-11 min-w-11 items-center justify-center px-2 text-sm";

export default function Pagination({
  filters,
  page,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-1 border-t border-ink/10 pt-6"
    >
      {page > 1 ? (
        <Link
          href={buildShopHref(filters, { page: page - 1 })}
          aria-label="Previous page"
          className={itemClass}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${itemClass} opacity-30`}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pageList(page, totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className={itemClass} aria-hidden="true">
            …
          </span>
        ) : item === page ? (
          <span
            key={item}
            aria-current="page"
            className={`${itemClass} border-b-2 border-ink font-medium`}
          >
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={buildShopHref(filters, { page: item })}
            aria-label={`Page ${item}`}
            className={`${itemClass} hover:underline`}
          >
            {item}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={buildShopHref(filters, { page: page + 1 })}
          aria-label="Next page"
          className={itemClass}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${itemClass} opacity-30`}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-serif text-3xl uppercase tracking-[0.3em]">
        We&rsquo;ll be right back
      </h1>
      <span
        aria-hidden="true"
        className="mx-auto mt-4 block h-1.5 w-1.5 rounded-full bg-gold"
      />
      <p className="mt-5 text-ink/70">
        Something went wrong on our side while loading this page. Please try
        again in a moment.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
        <button
          type="button"
          onClick={reset}
          className="h-12 bg-ink px-8 text-xs uppercase tracking-[0.2em] text-cream hover:bg-accent"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center text-xs uppercase tracking-[0.15em] underline underline-offset-4"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
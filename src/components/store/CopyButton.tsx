"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyButton({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2000);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="inline-flex h-11 min-w-24 items-center justify-center gap-1.5 text-xs uppercase tracking-[0.15em] underline underline-offset-4"
      >
        {state === "copied" ? (
          <>
            <Check className="h-4 w-4" aria-hidden="true" /> Copied
          </>
        ) : state === "failed" ? (
          "Select and copy"
        ) : (
          <>
            <Copy className="h-4 w-4" aria-hidden="true" /> Copy
          </>
        )}
      </button>
      <span role="status" className="sr-only">
        {state === "copied" ? `${label} copied` : ""}
      </span>
    </>
  );
}
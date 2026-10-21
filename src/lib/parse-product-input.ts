import "server-only";
import { isOwnImageUrl } from "@/lib/cloudinary";
import {
  productInputSchema,
  type ProductFormResult,
  type ProductInput,
} from "@/lib/product-validators";

type Failure = Extract<ProductFormResult, { ok: false }>;

export function parseProductInput(
  payload: unknown,
): { ok: true; input: ProductInput } | { ok: false; result: Failure } {
  const parsed = productInputSchema.safeParse(payload);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (!fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return {
      ok: false,
      result: {
        ok: false,
        message: "Please check the highlighted fields.",
        fieldErrors,
      },
    };
  }

  if (!parsed.data.images.every(isOwnImageUrl)) {
    return {
      ok: false,
      result: {
        ok: false,
        message: "One of the photos is not from our image library.",
        fieldErrors: { images: "Please upload the photos again." },
      },
    };
  }

  return { ok: true, input: parsed.data };
}
import { z } from "zod";
import { scentFamilies } from "@/config/scents";

const variantSchema = z.object({
  size: z.string().trim().min(1, "Enter a size, e.g. 50ml").max(30),
  price: z
    .number()
    .int("Price must be a whole number")
    .min(100, "Enter a price of at least ₦100")
    .max(10_000_000, "That price is too high"),
  available: z.boolean(),
});

export const productInputSchema = z.object({
  brand: z.string().trim().min(2, "Enter the brand").max(80),
  name: z.string().trim().min(2, "Enter the perfume name").max(120),
  description: z
    .string()
    .trim()
    .max(1000, "Keep the description under 1000 characters"),
  scentFamilies: z.array(z.enum(scentFamilies)),
  variants: z
    .array(variantSchema)
    .min(1, "Add at least one size")
    .max(8, "At most 8 sizes")
    .refine(
      (variants) =>
        new Set(variants.map((variant) => variant.size.toLowerCase())).size ===
        variants.length,
      "Each size can only be listed once",
    ),
  featured: z.boolean(),
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// What the form gets back from the server
export type ProductFormResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };
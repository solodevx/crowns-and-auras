import { z } from "zod";
import { NOTE_LIMIT, noteSlugs } from "@/config/notes";
import { scentFamilies } from "@/config/scents";
import { sortVariantsBySize } from "@/lib/variants";

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
  // The id of a brand record. The server checks it really exists.
  brandId: z.string().regex(/^[a-f\d]{24}$/i, "Choose a brand from the list"),
  name: z.string().trim().min(2, "Enter the perfume name").max(120),
  description: z
    .string()
    .trim()
    .max(1000, "Keep the description under 1000 characters"),
  images: z
    .array(z.string().startsWith("https://res.cloudinary.com/"))
    .max(5, "At most 5 photos"),
  scentFamilies: z.array(z.enum(scentFamilies)),
  notes: z
    .array(z.enum(noteSlugs))
    .max(NOTE_LIMIT, `Choose at most ${NOTE_LIMIT} notes`)
    .transform((notes) => [...new Set(notes)]),
  variants: z
    .array(variantSchema)
    .min(1, "Add at least one size")
    .max(8, "At most 8 sizes")
    .refine(
      (variants) =>
        new Set(variants.map((variant) => variant.size.toLowerCase())).size ===
        variants.length,
      "Each size can only be listed once",
    )
    .transform((variants) => sortVariantsBySize(variants)),
  featured: z.boolean(),
  isActive: z.boolean(),
});

export type ProductInput = z.infer<typeof productInputSchema>;

// What the form gets back from the server
export type ProductFormResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };
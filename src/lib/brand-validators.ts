import { z } from "zod";

export const brandInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter the brand name")
    .max(80, "That name is too long"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Enter a web address")
    .max(80, "That address is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and single hyphens only",
    ),
  description: z
    .string()
    .trim()
    .max(500, "Keep the description under 500 characters"),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || value.startsWith("https://res.cloudinary.com/"),
      "Please upload the image again",
    ),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  displayOrder: z
    .number()
    .int("Use a whole number")
    .min(0, "Use 0 or higher")
    .max(9999, "Use a number under 10000"),
});

export type BrandInput = z.infer<typeof brandInputSchema>;

// What the form gets back from the server
export type BrandFormResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };
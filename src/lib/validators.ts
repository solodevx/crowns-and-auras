import { z } from "zod";
import { deliveryZones } from "@/config/delivery-zones";

// Nigerian mobile numbers: 0 or +234, then 7/8/9, then 0/1, then 8 more digits
const nigerianPhonePattern = /^(?:0|\+234)[789][01]\d{8}$/;

export const checkoutSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name")
    .max(100, "That name is too long"),

  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[\s-]/g, "")) // remove spaces and dashes
    .refine(
      (value) => nigerianPhonePattern.test(value),
      "Enter a valid Nigerian phone number, e.g. 08012345678",
    ),

  // Optional: an empty box is fine, but if something is typed it must look like an email
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\S+@\S+\.\S+$/.test(value),
      "Enter a valid email address",
    ),

  address: z
    .string()
    .trim()
    .min(10, "Please enter your full delivery address")
    .max(300, "That address is too long"),

  zoneId: z
    .string()
    .refine(
      (zoneId) => deliveryZones.some((zone) => zone.id === zoneId),
      "Please choose your delivery area",
    ),

  notes: z.string().trim().max(500, "Notes can be at most 500 characters"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
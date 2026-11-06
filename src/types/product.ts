import type { ScentFamily } from "@/config/scents";

export type ProductVariant = {
  size: string; // e.g. "50ml", "100ml", "Full size"
  price: number; // whole naira, e.g. 45000
  available: boolean; // no stock counts: she buys after the order
};

export type Product = {
  id: string;
  slug: string; // the web address part: /shop/velvet-oud
  brand: string; // the brand's name, for display
  brandSlug: string; // the brand's web address, used by the shop's brand filter
  name: string;
  description: string;
  scentFamilies: ScentFamily[];
  images: string[]; // image addresses (empty for now)
  variants: ProductVariant[];
  featured: boolean;
};
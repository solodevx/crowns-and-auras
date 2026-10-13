import type { Product } from "@/types/product";
import { placeholderProducts } from "@/data/placeholder-products";

// The lowest price across all sizes, used for "From ₦X"
export function getStartingPrice(product: Product): number {
  return Math.min(...product.variants.map((variant) => variant.price));
}

// A product counts as available if at least one size is available
export function isProductAvailable(product: Product): boolean {
  return product.variants.some((variant) => variant.available);
}

export function getProductBySlug(slug: string): Product | undefined {
  return placeholderProducts.find((Product) => Product.slug === slug);
}
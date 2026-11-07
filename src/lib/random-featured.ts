import { getFeaturedBrands } from "@/lib/brands";
import { getFeaturedProducts } from "@/lib/products";
import { shuffle } from "@/lib/shuffle";

// Both lookups wait for a real visit first, so the shuffle is different for
// every visitor and is never frozen into the pre-built page.
export async function getRandomFeaturedProducts(count: number) {
  const pool = await getFeaturedProducts();
  return shuffle(pool).slice(0, count);
}

export async function getRandomFeaturedBrands(count: number) {
  const pool = await getFeaturedBrands();
  return shuffle(pool).slice(0, count);
}
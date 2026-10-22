import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { getSiteUrl } from "@/lib/site-url";

// Only visible perfumes appear here, because getProducts skips hidden ones.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const products = await getProducts();

  return [
    { url: baseUrl },
    { url: `${baseUrl}/shop` },
    ...products.map((product) => ({
      url: `${baseUrl}/shop/${product.slug}`,
    })),
  ];
}
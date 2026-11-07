import type { MetadataRoute } from "next";
import { getActiveBrands } from "@/lib/brands";
import { getProducts } from "@/lib/products";
import { getSiteUrl } from "@/lib/site-url";

// Only visible perfumes and active brands appear here.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const [products, brands] = await Promise.all([
    getProducts(),
    getActiveBrands(),
  ]);

  return [
    { url: baseUrl },
    { url: `${baseUrl}/shop` },
    { url: `${baseUrl}/brands` },
    { url: `${baseUrl}/privacy` },
    ...brands.map((brand) => ({ url: `${baseUrl}/brands/${brand.slug}` })),
    ...products.map((product) => ({
      url: `${baseUrl}/shop/${product.slug}`,
    })),
  ];
}
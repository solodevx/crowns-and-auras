import mongoose from "mongoose";
import type { ScentFamily } from "../src/config/scents";
import { slugify } from "../src/lib/slug";
import { Brand } from "../src/models/Brand";
import { Product } from "../src/models/Product";

// TEST DATA ONLY: invented brands and perfumes for the development database.
const brands = [
  {
    name: "Maison Aurelle",
    description: "Test brand: warm, classic blends.",
    isFeatured: true,
    isActive: true,
    displayOrder: 10,
  },
  {
    name: "Nova & Co",
    description: "Test brand: bright and modern.",
    isFeatured: true,
    isActive: true,
    displayOrder: 20,
  },
  {
    name: "Luna Atelier",
    description: "Test brand: soft and cozy.",
    isFeatured: true,
    isActive: true,
    displayOrder: 30,
  },
  {
    name: "Dormant House",
    description: "Test brand: switched off on purpose.",
    isFeatured: false,
    isActive: false,
    displayOrder: 40,
  },
];

type Variant = { size: string; price: number; available: boolean };
type Perfume = {
  brand: string;
  name: string;
  description: string;
  scents: ScentFamily[];
  variants: Variant[];
  featured: boolean;
  isActive: boolean;
};

const perfumes: Perfume[] = [
  {
    brand: "Maison Aurelle",
    name: "Velvet Oud",
    description: "Test perfume: warm, smoky oud softened with vanilla.",
    scents: ["woody-and-deep", "warm-and-sensual"],
    variants: [
      { size: "50ml", price: 38000, available: true },
      { size: "100ml", price: 62000, available: true },
    ],
    featured: true,
    isActive: true,
  },
  {
    brand: "Maison Aurelle",
    name: "Midnight Rose",
    description: "Test perfume: dark rose with a hint of musk.",
    scents: ["floral-bouquets", "soft-musk"],
    variants: [{ size: "100ml", price: 58000, available: true }],
    featured: true,
    isActive: true,
  },
  {
    brand: "Nova & Co",
    name: "Citrus Dawn",
    description: "Test perfume: bright bergamot and lemon.",
    scents: ["citrus-bright", "fresh-and-radiant"],
    variants: [
      { size: "50ml", price: 28000, available: true },
      { size: "100ml", price: 45000, available: false },
    ],
    featured: true,
    isActive: true,
  },
  {
    brand: "Nova & Co",
    name: "Green Sage",
    description:
      "Test perfume: herbal sage and cedar. Every size is unavailable on purpose.",
    scents: ["aromatic-and-herbal", "fresh-and-radiant"],
    variants: [{ size: "100ml", price: 41000, available: false }],
    featured: false,
    isActive: true,
  },
  {
    brand: "Nova & Co",
    name: "Amber Spice",
    description: "Test perfume: a hidden product, to test the hidden rule.",
    scents: ["warm-and-sensual"],
    variants: [
      { size: "50ml", price: 34000, available: true },
      { size: "100ml", price: 52000, available: true },
    ],
    featured: false,
    isActive: false,
  },
  {
    brand: "Luna Atelier",
    name: "Sweet Cashmere",
    description: "Test perfume: creamy caramel and soft amber.",
    scents: ["sweet-and-gourmand", "warm-and-sensual"],
    variants: [
      { size: "30ml", price: 22000, available: true },
      { size: "50ml", price: 33000, available: true },
    ],
    featured: true,
    isActive: true,
  },
  {
    brand: "Luna Atelier",
    name: "White Musk Noir",
    description: "Test perfume: soft musk with a dark woody base.",
    scents: ["soft-musk", "woody-and-deep"],
    variants: [
      { size: "50ml", price: 36000, available: true },
      { size: "100ml", price: 54000, available: true },
    ],
    featured: true,
    isActive: true,
  },
  {
    brand: "Luna Atelier",
    name: "Petal Veil",
    description: "Test perfume: a light bouquet of petals.",
    scents: ["floral-bouquets"],
    variants: [
      { size: "50ml", price: 30000, available: true },
      { size: "100ml", price: 48000, available: true },
    ],
    featured: false,
    isActive: true,
  },
  {
    brand: "Dormant House",
    name: "Quiet Hours",
    description:
      "Test perfume: belongs to an inactive brand, to test that rule.",
    scents: ["soft-musk"],
    variants: [{ size: "50ml", price: 25000, available: true }],
    featured: false,
    isActive: true,
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is missing");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    const databaseName = mongoose.connection.name;
    console.log("Database:", databaseName);
    if (databaseName.endsWith("-prod")) {
      throw new Error("Refusing to put test data in the PRODUCTION database.");
    }

    let brandsAdded = 0;
    const brandIds = new Map<string, mongoose.Types.ObjectId>();

    for (const brand of brands) {
      const slug = slugify(brand.name);
      // $setOnInsert: only writes when the brand is new, never overwrites
      const result = await Brand.updateOne(
        { slug },
        { $setOnInsert: { ...brand, slug } },
        { upsert: true },
      );
      if (result.upsertedCount > 0) brandsAdded += 1;
      const saved = await Brand.findOne({ slug });
      if (saved) brandIds.set(brand.name, saved._id);
    }

    let productsAdded = 0;
    for (const perfume of perfumes) {
      const brandId = brandIds.get(perfume.brand);
      if (!brandId) continue;
      const slug = slugify(`${perfume.brand} ${perfume.name}`);
      const result = await Product.updateOne(
        { slug },
        {
          $setOnInsert: {
            slug,
            brandId,
            brand: perfume.brand,
            name: perfume.name,
            description: perfume.description,
            scentFamilies: perfume.scents,
            images: [],
            variants: perfume.variants,
            featured: perfume.featured,
            isActive: perfume.isActive,
          },
        },
        { upsert: true },
      );
      if (result.upsertedCount > 0) productsAdded += 1;
    }

    console.log(
      `Brands added: ${brandsAdded}. Perfumes added: ${productsAdded}.`,
    );
  } catch (error) {
    console.error(
      "Seed failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
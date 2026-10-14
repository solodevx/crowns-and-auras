import mongoose from "mongoose";
import { placeholderProducts } from "./seed-data";
import { Product } from "../src/models/Product";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is missing in .env.local");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });

    // "Upsert": update the perfume if its slug exists, otherwise add it.
    // Running the script twice never creates duplicates.
    const operations = placeholderProducts.map((placeholder) => ({
      updateOne: {
        filter: { slug: placeholder.slug },
        update: {
          $set: {
            slug: placeholder.slug,
            brand: placeholder.brand,
            name: placeholder.name,
            description: placeholder.description,
            scentFamilies: placeholder.scentFamilies,
            images: placeholder.images,
            variants: placeholder.variants,
            featured: placeholder.featured,
            isActive: true,
          },
        },
        upsert: true,
      },
    }));

    const result = await Product.bulkWrite(operations);
    console.log(
      `Seed done. Added: ${result.upsertedCount}, updated: ${result.modifiedCount}`,
    );
  } catch (error) {
    console.error("Seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();

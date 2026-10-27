import mongoose from "mongoose";
import { syncProductsWithBrand } from "../src/lib/product-slug";
import { Brand } from "../src/models/Brand";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is missing");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("Database:", mongoose.connection.name);
    if (
      mongoose.connection.name.endsWith("-prod") &&
      process.env.ALLOW_PROD !== "1"
    ) {
      throw new Error(
        "This is the PRODUCTION database. Set ALLOW_PROD=1 to run on purpose.",
      );
    }

    let changed = 0;
    const brands = await Brand.find({}, { name: 1 }).lean();
    for (const brand of brands) {
      if (!brand.name) continue;
      changed += await syncProductsWithBrand(brand._id, brand.name);
    }
    console.log(`Perfume addresses updated: ${changed}.`);
  } catch (error) {
    console.error(
      "Sync failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
import mongoose from "mongoose";
import { scentFamilies } from "../src/config/scents";
import { Product } from "../src/models/Product";

// Old internal names -> the eight categories
const renames: Record<string, string> = {
  Floral: "floral-bouquets",
  Woody: "woody-and-deep",
  Citrus: "citrus-bright",
  Sweet: "sweet-and-gourmand",
  Oriental: "warm-and-sensual",
  Fresh: "fresh-and-radiant",
  Musky: "soft-musk",
  Aromatic: "aromatic-and-herbal",
};

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
    for (const [oldName, newSlug] of Object.entries(renames)) {
      // The plain driver is used because the old names are no longer valid values
      const result = await Product.collection.updateMany(
        { scentFamilies: oldName },
        { $set: { "scentFamilies.$[element]": newSlug } },
        { arrayFilters: [{ element: oldName }] },
      );
      changed += result.modifiedCount;
    }

    const unknown = await Product.countDocuments({
      scentFamilies: { $elemMatch: { $nin: [...scentFamilies] } },
    });
    console.log(
      `Products updated: ${changed}. Products still holding an unknown scent value: ${unknown}.`,
    );
  } catch (error) {
    console.error(
      "Migration failed:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
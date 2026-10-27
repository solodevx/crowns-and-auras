import mongoose from "mongoose";
import { slugify } from "../src/lib/slug";
import { Brand } from "../src/models/Brand";
import { Product } from "../src/models/Product";

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

    const names = ((await Product.distinct("brand")) as string[])
      .map((name) => name.trim())
      .filter(Boolean)
      .sort((first, second) => first.localeCompare(second));

    let created = 0;
    let linked = 0;
    let order = (await Brand.countDocuments()) * 10;

    for (const name of names) {
      const slug = slugify(name);
      if (!slug) {
        console.warn(`Skipped "${name}": cannot build a slug from it`);
        continue;
      }

      // Insert-only: an existing brand is never changed
      let brand = await Brand.findOne({ slug });
      if (!brand) {
        order += 10;
        brand = await Brand.create({ name, slug, displayOrder: order });
        created += 1;
      } else if (brand.name !== name) {
        console.warn(
          `"${name}" has the same slug ("${slug}") as "${brand.name}", so it was linked to that brand`,
        );
      }

      // Only products that have no brand link yet
      const result = await Product.updateMany(
        { brand: name, brandId: null },
        { $set: { brandId: brand._id } },
      );
      linked += result.modifiedCount;
    }

    const stillUnlinked = await Product.countDocuments({ brandId: null });
    console.log(
      `Brands created: ${created}. Products linked: ${linked}. Products still without a brand: ${stillUnlinked}.`,
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
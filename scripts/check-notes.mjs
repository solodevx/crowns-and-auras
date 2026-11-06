import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is missing");
  process.exit(1);
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const name = mongoose.connection.name;
  console.log("Database:", name);
  if (name.endsWith("-prod") && process.env.ALLOW_PROD !== "1") {
    throw new Error(
      "Production database. Set ALLOW_PROD=1 to look on purpose.",
    );
  }

  const products = await mongoose.connection.db
    .collection("products")
    .find({}, { projection: { name: 1, notes: 1 } })
    .toArray();
  for (const product of products) {
    console.log(
      `${product.name}: notes = ${JSON.stringify(product.notes ?? "(field missing)")}`,
    );
  }
} catch (error) {
  console.error("Failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
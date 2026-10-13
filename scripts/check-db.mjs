import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is missing in .env.local");
  process.exit(1);
}

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("Connected to MongoDB, database:", mongoose.connection.name);
} catch (error) {
  console.error("Connection failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
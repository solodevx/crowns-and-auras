import mongoose from "mongoose";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// In dev, the server reloads often. Keeping the connection on globalThis
// stops us from opening a new one on every reload.
const globalForMongoose = globalThis as unknown as {
  mongooseCache?: MongooseCache;
};
const cache: MongooseCache = (globalForMongoose.mongooseCache ??= {
  connection: null,
  promise: null,
});

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local");

  if (cache.connection) return cache.connection;

  cache.promise ??= mongoose.connect(uri, { bufferCommands: false });
  try {
    cache.connection = await cache.promise;
  } catch (error) {
    cache.promise = null; // allow a retry next time
    throw error;
  }
  return cache.connection;
}
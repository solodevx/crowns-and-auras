import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const rateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true },
  // The database deletes the record by itself once this time has passed
  expiresAt: { type: Date, required: true },
});
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RateLimitDocument = InferSchemaType<typeof rateLimitSchema>;

export const RateLimit: Model<RateLimitDocument> =
  mongoose.models.RateLimit ??
  mongoose.model<RateLimitDocument>("RateLimit", rateLimitSchema);
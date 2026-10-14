import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // The scrambled password. The real password is NEVER stored.
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export type AdminDocument = InferSchemaType<typeof adminSchema>;

export const Admin: Model<AdminDocument> =
  mongoose.models.Admin ?? mongoose.model<AdminDocument>("Admin", adminSchema);

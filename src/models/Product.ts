import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { scentFamilies } from "@/config/scents";

// One size of a perfume, with its own price and availability
const variantSchema = new Schema(
  {
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true },
  },
  { _id: false },
);

const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    scentFamilies: [{ type: String, enum: [...scentFamilies] }],
    images: [{ type: String }],
    variants: {
      type: [variantSchema],
      validate: {
        validator: (variants: unknown[]) => variants.length > 0,
        message: "A product needs at least one size",
      },
    },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const Product: Model<ProductDocument> =
  mongoose.models.Product ??
  mongoose.model<ProductDocument>("Product", productSchema);

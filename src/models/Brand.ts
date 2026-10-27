import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const brandSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Old web addresses of this brand, so old links can redirect to the new one
    previousSlugs: { type: [String], default: [], index: true },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    // A Cloudinary address. The picture itself is never stored in MongoDB.
    imageUrl: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

brandSchema.index({ isActive: 1, isFeatured: 1, displayOrder: 1 });

export type BrandDocument = InferSchemaType<typeof brandSchema>;

export const Brand: Model<BrandDocument> =
  mongoose.models.Brand ?? mongoose.model<BrandDocument>("Brand", brandSchema);
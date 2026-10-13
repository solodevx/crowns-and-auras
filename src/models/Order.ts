import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// A copy of the item as it was when ordered, so later price changes
// never rewrite old orders.
const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    brand: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 10 },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, trim: true },
    },
    delivery: {
      address: { type: String, required: true, trim: true },
      zone: { type: String, required: true },
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: "An order needs at least one item",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "completed", "cancelled"],
      default: "pending",
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

export type OrderDocument = InferSchemaType<typeof orderSchema>;

// The first half reuses the model if the dev server already created it
export const Order: Model<OrderDocument> =
  mongoose.models.Order ?? mongoose.model<OrderDocument>("Order", orderSchema);
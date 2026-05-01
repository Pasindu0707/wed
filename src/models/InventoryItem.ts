import mongoose, { Schema, model, type InferSchemaType, Types } from "mongoose";

const InventoryItemSchema = new Schema(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true, index: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: false },
    unit: { type: String, required: false }, // e.g. "nos" | "kg" | "g" | "bottles"
    handedOverTo: { type: String, required: false },
    status: { type: String, required: true, enum: ["handed_over", "pending", "returned", "missing"], default: "pending" },
    notes: { type: String, required: false },
    photoRequired: { type: Boolean, required: true, default: false },
    billRequired: { type: Boolean, required: true, default: false }
  },
  { timestamps: true }
);

InventoryItemSchema.index({ weddingId: 1, status: 1 });

export type InventoryItemDoc = InferSchemaType<typeof InventoryItemSchema> & { _id: Types.ObjectId };

export const InventoryItemModel = mongoose.models.InventoryItem ?? model("InventoryItem", InventoryItemSchema);


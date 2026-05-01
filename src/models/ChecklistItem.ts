import mongoose, { Schema, model, type InferSchemaType, Types } from "mongoose";

const ChecklistItemSchema = new Schema(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true, index: true },
    section: {
      type: String,
      required: true,
      enum: ["Church", "Hotel", "Inventory", "PhotoVideo", "Timeline", "RobeShoot", "FinalHandover", "Other"]
    },
    title: { type: String, required: true },
    description: { type: String, required: false },
    notes: { type: String, required: false },
    priority: { type: String, required: true, enum: ["low", "medium", "high", "critical"], default: "medium" },
    status: { type: String, required: true, enum: ["pending", "in_progress", "done", "issue"], default: "pending" },
    dueTime: { type: String, required: false }, // "04:30 AM" (display-friendly)
    assignedTo: { type: String, required: false },
    imageRefs: { type: [String], required: false, default: undefined },
    sortOrder: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

ChecklistItemSchema.index({ weddingId: 1, section: 1, sortOrder: 1 });
ChecklistItemSchema.index({ weddingId: 1, status: 1 });

export type ChecklistItemDoc = InferSchemaType<typeof ChecklistItemSchema> & { _id: Types.ObjectId };

export const ChecklistItemModel = mongoose.models.ChecklistItem ?? model("ChecklistItem", ChecklistItemSchema);


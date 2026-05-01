import mongoose, { Schema, model, type InferSchemaType, Types } from "mongoose";

const ReferenceImageSchema = new Schema(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true, index: true },
    area: {
      type: String,
      required: true,
      enum: ["Church", "Hotel", "Cake", "Table", "Entrance", "SetteeBack", "MainTable", "Other"]
    },
    fileName: { type: String, required: true },
    expectedDetails: { type: String, required: false },
    description: { type: String, required: false },
    checklistNotes: { type: String, required: false },
    status: { type: String, required: true, enum: ["not_checked", "matches", "issue"], default: "not_checked" },
    notes: { type: String, required: false }
  },
  { timestamps: true }
);

ReferenceImageSchema.index({ weddingId: 1, area: 1 });

export type ReferenceImageDoc = InferSchemaType<typeof ReferenceImageSchema> & { _id: Types.ObjectId };

export const ReferenceImageModel = mongoose.models.ReferenceImage ?? model("ReferenceImage", ReferenceImageSchema);


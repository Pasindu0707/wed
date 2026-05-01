import mongoose, { Schema, model, type InferSchemaType, Types } from "mongoose";

const TimelineItemSchema = new Schema(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true, index: true },
    time: { type: String, required: true }, // "04:30 AM"
    title: { type: String, required: true },
    location: { type: String, required: false },
    description: { type: String, required: false },
    status: { type: String, required: true, enum: ["pending", "done", "delayed", "issue"], default: "pending" },
    sortOrder: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

TimelineItemSchema.index({ weddingId: 1, sortOrder: 1 });
TimelineItemSchema.index({ weddingId: 1, time: 1 });

export type TimelineItemDoc = InferSchemaType<typeof TimelineItemSchema> & { _id: Types.ObjectId };

export const TimelineItemModel = mongoose.models.TimelineItem ?? model("TimelineItem", TimelineItemSchema);


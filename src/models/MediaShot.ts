import mongoose, { Schema, model, type InferSchemaType, Types } from "mongoose";

const MediaShotSchema = new Schema(
  {
    weddingId: { type: Schema.Types.ObjectId, ref: "Wedding", required: true, index: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    required: { type: Boolean, required: true, default: true },
    status: { type: String, required: true, enum: ["pending", "captured", "missed"], default: "pending" },
    notes: { type: String, required: false }
  },
  { timestamps: true }
);

MediaShotSchema.index({ weddingId: 1, category: 1 });
MediaShotSchema.index({ weddingId: 1, status: 1 });

export type MediaShotDoc = InferSchemaType<typeof MediaShotSchema> & { _id: Types.ObjectId };

export const MediaShotModel = mongoose.models.MediaShot ?? model("MediaShot", MediaShotSchema);


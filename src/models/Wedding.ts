import mongoose, { Schema, model, type InferSchemaType, Types } from "mongoose";

const LocationSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g. "Church" | "Hotel" | "Home"
    mapUrl: { type: String, required: false }
  },
  { _id: false }
);

const WeddingSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    coupleName: { type: String, required: true },
    date: { type: Date, required: true },
    churchName: { type: String, required: true },
    hotelName: { type: String, required: true },
    locations: { type: [LocationSchema], required: true, default: [] },
    notes: { type: String, required: false }
  },
  { timestamps: true }
);

WeddingSchema.index({ date: 1 });

export type WeddingDoc = InferSchemaType<typeof WeddingSchema> & { _id: Types.ObjectId };

export const WeddingModel = mongoose.models.Wedding ?? model("Wedding", WeddingSchema);


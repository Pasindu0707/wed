import mongoose, { Schema, model, type InferSchemaType } from "mongoose";

const ChecklistItemSchema = new Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    done: { type: Boolean, required: true, default: false },
    notes: { type: String, required: false },
    updatedAt: { type: Date, required: true, default: () => new Date() }
  },
  { _id: false }
);

const TimelineItemSchema = new Schema(
  {
    key: { type: String, required: true },
    time: { type: String, required: true }, // "04:30 AM"
    title: { type: String, required: true },
    details: { type: String, required: false },
    location: { type: String, required: false },
    contactName: { type: String, required: false },
    contactNumber: { type: String, required: false },
    vendor: { type: String, required: false },
    vendorNumber: { type: String, required: false },
    done: { type: Boolean, required: true, default: false },
    updatedAt: { type: Date, required: true, default: () => new Date() }
  },
  { _id: false }
);

const InventoryItemSchema = new Schema(
  {
    key: { type: String, required: true },
    item: { type: String, required: true },
    quantity: { type: String, required: false },
    handedOver: { type: Boolean, required: true, default: false },
    notes: { type: String, required: false },
    updatedAt: { type: Date, required: true, default: () => new Date() }
  },
  { _id: false }
);

const ShotItemSchema = new Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    priority: { type: String, required: true, enum: ["must", "nice"], default: "must" },
    done: { type: Boolean, required: true, default: false },
    updatedAt: { type: Date, required: true, default: () => new Date() }
  },
  { _id: false }
);

const VendorRefSchema = new Schema(
  {
    key: { type: String, required: true },
    title: { type: String, required: true },
    photoPath: { type: String, required: false }, // optional local ref path
    required: { type: Boolean, required: true, default: true },
    checked: { type: Boolean, required: true, default: false },
    notes: { type: String, required: false },
    updatedAt: { type: Date, required: true, default: () => new Date() }
  },
  { _id: false }
);

const NoteSchema = new Schema(
  {
    key: { type: String, required: true },
    text: { type: String, required: true },
    urgent: { type: Boolean, required: true, default: false },
    resolved: { type: Boolean, required: true, default: false },
    updatedAt: { type: Date, required: true, default: () => new Date() }
  },
  { _id: false }
);

const EventSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    coupleName: { type: String, required: true },
    dateISO: { type: String, required: true }, // "2026-05-02"
    locations: {
      type: [
        {
          key: { type: String, required: true },
          name: { type: String, required: true },
          mapsUrl: { type: String, required: false }
        }
      ],
      required: true,
      default: []
    },
    checklistSections: {
      type: [
        {
          key: { type: String, required: true },
          title: { type: String, required: true },
          items: { type: [ChecklistItemSchema], required: true, default: [] }
        }
      ],
      required: true,
      default: []
    },
    timeline: { type: [TimelineItemSchema], required: true, default: [] },
    inventory: { type: [InventoryItemSchema], required: true, default: [] },
    shots: { type: [ShotItemSchema], required: true, default: [] },
    vendorRefs: { type: [VendorRefSchema], required: true, default: [] },
    notes: { type: [NoteSchema], required: true, default: [] }
  },
  { timestamps: true }
);

export type EventDoc = InferSchemaType<typeof EventSchema>;

export const EventModel = mongoose.models.Event ?? model("Event", EventSchema);


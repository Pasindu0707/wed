import { z } from "zod";

export const ObjectIdSchema = z.string().min(1);

export const WeddingCreateSchema = z.object({
  coupleName: z.string().min(1),
  date: z.coerce.date(),
  churchName: z.string().min(1),
  hotelName: z.string().min(1),
  locations: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.string().min(1),
        mapUrl: z.string().url().optional()
      })
    )
    .default([]),
  notes: z.string().optional()
});

export const WeddingUpdateSchema = WeddingCreateSchema.partial();

export const ChecklistCreateSchema = z.object({
  weddingId: ObjectIdSchema,
  section: z.enum(["Church", "Hotel", "Inventory", "PhotoVideo", "Timeline", "RobeShoot", "FinalHandover", "Other"]),
  title: z.string().min(1),
  description: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: z.enum(["pending", "in_progress", "done", "issue"]).default("pending"),
  dueTime: z.string().optional(),
  assignedTo: z.string().optional(),
  imageRefs: z.array(z.string()).optional(),
  sortOrder: z.number().int().default(0)
});
export const ChecklistUpdateSchema = ChecklistCreateSchema.partial().omit({ weddingId: true });

export const TimelineCreateSchema = z.object({
  weddingId: ObjectIdSchema,
  time: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["pending", "done", "delayed", "issue"]).default("pending"),
  sortOrder: z.number().int().default(0)
});
export const TimelineUpdateSchema = TimelineCreateSchema.partial().omit({ weddingId: true });

export const InventoryCreateSchema = z.object({
  weddingId: ObjectIdSchema,
  itemName: z.string().min(1),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  handedOverTo: z.string().optional(),
  status: z.enum(["handed_over", "pending", "returned", "missing"]).default("pending"),
  notes: z.string().optional(),
  photoRequired: z.boolean().default(false),
  billRequired: z.boolean().default(false)
});
export const InventoryUpdateSchema = InventoryCreateSchema.partial().omit({ weddingId: true });

export const MediaShotCreateSchema = z.object({
  weddingId: ObjectIdSchema,
  category: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  required: z.boolean().default(true),
  status: z.enum(["pending", "captured", "missed"]).default("pending"),
  notes: z.string().optional()
});
export const MediaShotUpdateSchema = MediaShotCreateSchema.partial().omit({ weddingId: true });

export const ReferenceImageCreateSchema = z.object({
  weddingId: ObjectIdSchema,
  area: z.enum(["Church", "Hotel", "Cake", "Table", "Entrance", "SetteeBack", "MainTable", "Other"]),
  fileName: z.string().min(1),
  expectedDetails: z.string().optional(),
  description: z.string().optional(),
  checklistNotes: z.string().optional(),
  status: z.enum(["not_checked", "matches", "issue"]).default("not_checked"),
  notes: z.string().optional()
});
export const ReferenceImageUpdateSchema = ReferenceImageCreateSchema.partial().omit({ weddingId: true });


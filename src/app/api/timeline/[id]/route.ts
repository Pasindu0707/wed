import { connectToDatabase } from "@/lib/db";
import { isObjectId, jsonError, jsonOk } from "@/lib/api";
import { TimelineUpdateSchema } from "@/lib/validators";
import { TimelineItemModel } from "@/models/TimelineItem";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!isObjectId(params.id)) return jsonError("Invalid id", 400);
  try {
    await connectToDatabase();
    const item = await TimelineItemModel.findById(params.id).lean();
    if (!item) return jsonError("Not found", 404);
    return jsonOk({ item });
  } catch {
    return jsonError("Failed to load timeline item", 500);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isObjectId(params.id)) return jsonError("Invalid id", 400);
  try {
    const parsed = TimelineUpdateSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid payload", 400, parsed.error.flatten());

    await connectToDatabase();
    const item = await TimelineItemModel.findByIdAndUpdate(params.id, parsed.data, { new: true }).lean();
    if (!item) return jsonError("Not found", 404);
    return jsonOk({ item });
  } catch {
    return jsonError("Failed to update timeline item", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isObjectId(params.id)) return jsonError("Invalid id", 400);
  try {
    await connectToDatabase();
    const res = await TimelineItemModel.findByIdAndDelete(params.id).lean();
    if (!res) return jsonError("Not found", 404);
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Failed to delete timeline item", 500);
  }
}


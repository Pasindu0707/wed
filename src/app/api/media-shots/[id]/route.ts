import { connectToDatabase } from "@/lib/db";
import { isObjectId, jsonError, jsonOk } from "@/lib/api";
import { MediaShotUpdateSchema } from "@/lib/validators";
import { MediaShotModel } from "@/models/MediaShot";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!isObjectId(params.id)) return jsonError("Invalid id", 400);
  try {
    await connectToDatabase();
    const item = await MediaShotModel.findById(params.id).lean();
    if (!item) return jsonError("Not found", 404);
    return jsonOk({ item });
  } catch {
    return jsonError("Failed to load media shot", 500);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isObjectId(params.id)) return jsonError("Invalid id", 400);
  try {
    const parsed = MediaShotUpdateSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid payload", 400, parsed.error.flatten());

    await connectToDatabase();
    const item = await MediaShotModel.findByIdAndUpdate(params.id, parsed.data, { new: true }).lean();
    if (!item) return jsonError("Not found", 404);
    return jsonOk({ item });
  } catch {
    return jsonError("Failed to update media shot", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isObjectId(params.id)) return jsonError("Invalid id", 400);
  try {
    await connectToDatabase();
    const res = await MediaShotModel.findByIdAndDelete(params.id).lean();
    if (!res) return jsonError("Not found", 404);
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Failed to delete media shot", 500);
  }
}


import { connectToDatabase } from "@/lib/db";
import { isObjectId, jsonError, jsonOk } from "@/lib/api";
import { WeddingUpdateSchema } from "@/lib/validators";
import { WeddingModel } from "@/models/Wedding";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  if (!isObjectId(params.id)) return jsonError("Invalid id", 400);
  try {
    await connectToDatabase();
    const wedding = await WeddingModel.findById(params.id).lean();
    if (!wedding) return jsonError("Not found", 404);
    return jsonOk({ wedding });
  } catch {
    return jsonError("Failed to load wedding", 500);
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isObjectId(params.id)) return jsonError("Invalid id", 400);
  try {
    const parsed = WeddingUpdateSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid payload", 400, parsed.error.flatten());

    await connectToDatabase();
    const wedding = await WeddingModel.findByIdAndUpdate(params.id, parsed.data, { new: true }).lean();
    if (!wedding) return jsonError("Not found", 404);
    return jsonOk({ wedding });
  } catch {
    return jsonError("Failed to update wedding", 500);
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isObjectId(params.id)) return jsonError("Invalid id", 400);
  try {
    await connectToDatabase();
    const res = await WeddingModel.findByIdAndDelete(params.id).lean();
    if (!res) return jsonError("Not found", 404);
    return jsonOk({ ok: true });
  } catch {
    return jsonError("Failed to delete wedding", 500);
  }
}


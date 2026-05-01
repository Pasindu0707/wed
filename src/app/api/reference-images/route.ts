import { connectToDatabase } from "@/lib/db";
import { isObjectId, jsonCreated, jsonError, jsonOk, pickQuery } from "@/lib/api";
import { ReferenceImageCreateSchema } from "@/lib/validators";
import { ReferenceImageModel } from "@/models/ReferenceImage";
import { resolveWeddingIdBySlug } from "@/lib/weddingSlug";

export async function GET(req: Request) {
  const q = pickQuery(req);
  const weddingSlug = q.get("weddingSlug");
  const weddingId = q.get("weddingId");

  let resolvedWeddingId: string | null = null;
  if (weddingSlug) resolvedWeddingId = await resolveWeddingIdBySlug(weddingSlug);
  else if (weddingId && isObjectId(weddingId)) resolvedWeddingId = weddingId;

  if (!resolvedWeddingId || !isObjectId(resolvedWeddingId)) {
    return jsonError("weddingSlug (preferred) or weddingId query param required", 400);
  }

  try {
    await connectToDatabase();
    const items = await ReferenceImageModel.find({ weddingId: resolvedWeddingId }).sort({ area: 1, createdAt: 1 }).lean();
    return jsonOk({ items });
  } catch {
    return jsonError("Failed to load reference images", 500);
  }
}

export async function POST(req: Request) {
  try {
    const parsed = ReferenceImageCreateSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid payload", 400, parsed.error.flatten());
    if (!isObjectId(parsed.data.weddingId)) return jsonError("Invalid weddingId", 400);

    await connectToDatabase();
    const item = await ReferenceImageModel.create(parsed.data);
    return jsonCreated({ item });
  } catch {
    return jsonError("Failed to create reference image", 500);
  }
}


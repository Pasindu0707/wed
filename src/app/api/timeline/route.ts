import { connectToDatabase } from "@/lib/db";
import { isObjectId, jsonCreated, jsonError, jsonOk, pickQuery } from "@/lib/api";
import { TimelineCreateSchema } from "@/lib/validators";
import { TimelineItemModel } from "@/models/TimelineItem";
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
    const items = await TimelineItemModel.find({ weddingId: resolvedWeddingId }).sort({ sortOrder: 1, time: 1 }).lean();
    return jsonOk({ items });
  } catch {
    return jsonError("Failed to load timeline", 500);
  }
}

export async function POST(req: Request) {
  try {
    const parsed = TimelineCreateSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid payload", 400, parsed.error.flatten());
    if (!isObjectId(parsed.data.weddingId)) return jsonError("Invalid weddingId", 400);

    await connectToDatabase();
    const item = await TimelineItemModel.create(parsed.data);
    return jsonCreated({ item });
  } catch {
    return jsonError("Failed to create timeline item", 500);
  }
}


import { connectToDatabase } from "@/lib/db";
import { isObjectId, jsonCreated, jsonError, jsonOk, pickQuery } from "@/lib/api";
import { InventoryCreateSchema } from "@/lib/validators";
import { InventoryItemModel } from "@/models/InventoryItem";
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
    const items = await InventoryItemModel.find({ weddingId: resolvedWeddingId }).sort({ createdAt: 1 }).lean();
    return jsonOk({ items });
  } catch {
    return jsonError("Failed to load inventory", 500);
  }
}

export async function POST(req: Request) {
  try {
    const parsed = InventoryCreateSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid payload", 400, parsed.error.flatten());
    if (!isObjectId(parsed.data.weddingId)) return jsonError("Invalid weddingId", 400);

    await connectToDatabase();
    const item = await InventoryItemModel.create(parsed.data);
    return jsonCreated({ item });
  } catch {
    return jsonError("Failed to create inventory item", 500);
  }
}


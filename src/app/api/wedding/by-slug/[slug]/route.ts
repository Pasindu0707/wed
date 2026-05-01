import { connectToDatabase } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { WeddingModel } from "@/models/Wedding";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();
    const wedding = await WeddingModel.findOne({ slug: params.slug }).lean();
    if (!wedding) return jsonError("Not found", 404);
    return jsonOk({ wedding });
  } catch {
    return jsonError("Failed to load wedding", 500);
  }
}


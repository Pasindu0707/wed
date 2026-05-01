import { connectToDatabase } from "@/lib/db";
import { jsonCreated, jsonError, jsonOk } from "@/lib/api";
import { WeddingCreateSchema } from "@/lib/validators";
import { WeddingModel } from "@/models/Wedding";

export async function GET() {
  try {
    await connectToDatabase();
    const weddings = await WeddingModel.find().sort({ date: 1 }).lean();
    return jsonOk({ weddings });
  } catch (e) {
    return jsonError("Failed to load weddings", 500);
  }
}

export async function POST(req: Request) {
  try {
    const parsed = WeddingCreateSchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Invalid payload", 400, parsed.error.flatten());

    await connectToDatabase();
    const wedding = await WeddingModel.create(parsed.data);
    return jsonCreated({ wedding });
  } catch {
    return jsonError("Failed to create wedding", 500);
  }
}


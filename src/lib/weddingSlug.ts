import { connectToDatabase } from "@/lib/db";
import { WeddingModel } from "@/models/Wedding";

export async function resolveWeddingIdBySlug(slug: string) {
  await connectToDatabase();
  const wedding = (await WeddingModel.findOne({ slug }).select({ _id: 1 }).lean()) as
    | { _id?: unknown }
    | null;
  return wedding?._id ? String(wedding._id) : null;
}


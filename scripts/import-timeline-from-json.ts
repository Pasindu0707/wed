import "dotenv/config";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { resolveWeddingIdBySlug } from "@/lib/weddingSlug";
import { TimelineItemModel } from "@/models/TimelineItem";

const ItemSchema = z.object({
  time: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["pending", "done", "delayed", "issue"]).default("pending"),
  sortOrder: z.number().int().default(0)
});

const FileSchema = z.array(ItemSchema).min(1);

function argValue(flag: string) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

async function main() {
  const slug = argValue("--slug") ?? process.env.WEDDING_SLUG ?? "suhashi-darshana";
  const jsonPath =
    argValue("--file") ??
    process.env.TIMELINE_JSON ??
    path.join(process.cwd(), "data", "timeline.sample.json");

  const replace = hasFlag("--replace");

  await connectToDatabase();
  const weddingId = await resolveWeddingIdBySlug(slug);
  if (!weddingId) throw new Error(`Wedding not found for slug: ${slug}`);

  const raw = await readFile(jsonPath, "utf8");
  const parsedJson = JSON.parse(raw) as unknown;
  const parsed = FileSchema.safeParse(parsedJson);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error(parsed.error.flatten());
    throw new Error("Invalid timeline JSON format");
  }

  const items = parsed.data;

  if (replace) {
    await TimelineItemModel.deleteMany({ weddingId });
  }

  // Upsert by (weddingId, time, title) to make re-runs safe without --replace.
  let upserts = 0;
  for (const it of items) {
    const res = await TimelineItemModel.updateOne(
      { weddingId, time: it.time, title: it.title },
      {
        $set: {
          location: it.location,
          description: it.description,
          status: it.status,
          sortOrder: it.sortOrder
        },
        $setOnInsert: { weddingId, time: it.time, title: it.title }
      },
      { upsert: true }
    );
    upserts += (res.upsertedCount ?? 0) + (res.modifiedCount ?? 0);
  }

  const total = await TimelineItemModel.countDocuments({ weddingId });

  // eslint-disable-next-line no-console
  console.log("Imported timeline items", {
    slug,
    file: jsonPath,
    replace,
    processed: items.length,
    changes: upserts,
    totalNow: total
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Import failed:", err);
  process.exit(1);
});


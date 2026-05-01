"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useChecklist } from "@/components/useChecklist";
import { Badge } from "@/components/ui/Badge";

export function CriticalBanner({ weddingSlug }: { weddingSlug: string }) {
  const { data } = useChecklist(weddingSlug);
  const count = useMemo(
    () => (data?.items ?? []).filter((i) => i.priority === "critical" && i.status !== "done").length,
    [data]
  );

  if (!count) return null;

  return (
    <div className="border-b border-red-200 bg-red-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 px-4 py-2">
        <div className="min-w-0 text-xs font-semibold text-red-900 truncate">Critical pending items need attention</div>
        <div className="flex items-center gap-2">
          <Badge tone="urgent">{count}</Badge>
          <Link
            href={`/wedding/${weddingSlug}/checklist`}
            className="rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-extrabold text-red-800"
          >
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}


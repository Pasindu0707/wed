"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTimeline, type TimelineItem, type TimelineStatus } from "@/components/useTimeline";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { parseTimeToMinutes } from "@/lib/time";

// When PDFs are provided, extract the schedule and insert as TimelineItem records.

async function createItem(payload: {
  weddingId: string;
  time: string;
  title: string;
  location?: string;
  description?: string;
  status?: TimelineStatus;
  sortOrder?: number;
}) {
  const res = await fetch(`/api/timeline`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
}

async function updateItem(id: string, patch: Partial<TimelineItem>) {
  const res = await fetch(`/api/timeline/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error(await res.text());
}

async function deleteItem(id: string) {
  const res = await fetch(`/api/timeline/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

export function TimelineEditor({ weddingSlug }: { weddingSlug: string }) {
  const { data, error, isLoading, mutate } = useTimeline(weddingSlug);

  const [draft, setDraft] = useState({
    time: "",
    title: "",
    location: "",
    description: ""
  });

  const items = useMemo(() => {
    const list = (data?.items ?? []).slice();
    list.sort((a, b) => (parseTimeToMinutes(a.time) ?? 1e9) - (parseTimeToMinutes(b.time) ?? 1e9));
    return list;
  }, [data]);

  const weddingId = items[0]?.weddingId ?? null;

  if (isLoading) return <div className="text-sm text-ink-700">Loading editor…</div>;
  if (error) return <div className="text-sm text-red-700">Failed to load items.</div>;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-ink-950">Edit timeline</div>
            <Link
              href={`/wedding/${weddingSlug}/timeline`}
              className="rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-900"
            >
              Back
            </Link>
          </div>
          <div className="mt-1 text-xs text-ink-700">Add / update / delete items manually (until PDFs are imported).</div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-2">
            <input
              value={draft.time}
              onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
              placeholder="Time (e.g. 04:30 AM)"
              className="h-12 rounded-2xl border border-ink-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
            />
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Title"
              className="h-12 rounded-2xl border border-ink-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
            />
            <input
              value={draft.location}
              onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
              placeholder="Location (optional)"
              className="h-12 rounded-2xl border border-ink-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
            />
            <textarea
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full resize-none rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
              rows={3}
            />

            <Button
              onClick={async () => {
                if (!weddingId) return;
                if (!draft.time.trim() || !draft.title.trim()) return;

                await createItem({
                  weddingId,
                  time: draft.time.trim(),
                  title: draft.title.trim(),
                  location: draft.location.trim() || undefined,
                  description: draft.description.trim() || undefined,
                  status: "pending",
                  sortOrder: 0
                });
                setDraft({ time: "", title: "", location: "", description: "" });
                await mutate();
              }}
              disabled={!weddingId}
            >
              Add timeline item
            </Button>

            {!weddingId ? (
              <div className="text-xs text-ink-700">
                No timeline items exist yet, so the editor can’t infer the wedding id. Seed the wedding checklist first (or
                add one timeline item via an API call including `weddingId`).
              </div>
            ) : null}
          </div>
        </CardBody>
      </Card>

      <div className="space-y-2">
        {items.map((it) => (
          <EditRow key={it._id} it={it} onSave={updateItem} onDelete={deleteItem} onDone={mutate} />
        ))}
      </div>
    </div>
  );
}

function EditRow({
  it,
  onSave,
  onDelete,
  onDone
}: {
  it: TimelineItem;
  onSave: (id: string, patch: Partial<TimelineItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDone: () => Promise<any>;
}) {
  const [local, setLocal] = useState({
    time: it.time,
    title: it.title,
    location: it.location ?? "",
    description: it.description ?? "",
    status: it.status as TimelineStatus
  });
  const [busy, setBusy] = useState<null | "save" | "delete">(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-ink-950 truncate">
              {it.time} • {it.title}
            </div>
            <div className="mt-1">
              <Badge tone={local.status === "issue" ? "urgent" : local.status === "delayed" ? "warn" : local.status === "done" ? "ok" : "neutral"}>
                {local.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={local.time}
              onChange={(e) => setLocal((s) => ({ ...s, time: e.target.value }))}
              className="h-11 rounded-2xl border border-ink-200 bg-white px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
            />
            <select
              value={local.status}
              onChange={(e) => setLocal((s) => ({ ...s, status: e.target.value as TimelineStatus }))}
              className="h-11 rounded-2xl border border-ink-200 bg-white px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
            >
              <option value="pending">pending</option>
              <option value="done">done</option>
              <option value="delayed">delayed</option>
              <option value="issue">issue</option>
            </select>
          </div>
          <input
            value={local.title}
            onChange={(e) => setLocal((s) => ({ ...s, title: e.target.value }))}
            className="h-11 rounded-2xl border border-ink-200 bg-white px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
          />
          <input
            value={local.location}
            onChange={(e) => setLocal((s) => ({ ...s, location: e.target.value }))}
            placeholder="Location"
            className="h-11 rounded-2xl border border-ink-200 bg-white px-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
          />
          <textarea
            value={local.description}
            onChange={(e) => setLocal((s) => ({ ...s, description: e.target.value }))}
            placeholder="Description"
            className="w-full resize-none rounded-2xl border border-ink-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-2">
            <Button
              size="md"
              disabled={busy !== null}
              onClick={async () => {
                setBusy("save");
                try {
                  await onSave(it._id, {
                    time: local.time.trim(),
                    title: local.title.trim(),
                    location: local.location.trim() || undefined,
                    description: local.description.trim() || undefined,
                    status: local.status
                  } as any);
                  await onDone();
                } finally {
                  setBusy(null);
                }
              }}
            >
              Save
            </Button>
            <Button
              size="md"
              variant="danger"
              disabled={busy !== null}
              onClick={async () => {
                setBusy("delete");
                try {
                  await onDelete(it._id);
                  await onDone();
                } finally {
                  setBusy(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}


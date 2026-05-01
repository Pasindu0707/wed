"use client";

import { useMemo, useState } from "react";
import { useEvent } from "@/components/useEvent";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

async function toggle(slug: string, key: string) {
  await fetch(`/api/events/${slug}/toggle`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "notes", key })
  });
}

async function addNote(slug: string, text: string, urgent: boolean) {
  await fetch(`/api/events/${slug}/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, urgent })
  });
}

export function Notes({ slug }: { slug: string }) {
  const { data, mutate, isLoading, error } = useEvent();
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(true);

  const notes = (data?.event?.notes ?? []) as any[];
  const openUrgent = useMemo(() => notes.filter((n) => n.urgent && !n.resolved).length, [notes]);

  if (isLoading) return <div className="text-sm text-ink-700">Loading…</div>;
  if (error) return <div className="text-sm text-red-700">Failed to load.</div>;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-ink-950">Urgent reminders</div>
            <Badge tone={openUrgent > 0 ? "urgent" : "ok"}>{openUrgent} open</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a note… (e.g. ‘Keep 2 water bottles in the car’)"
              className="w-full resize-none rounded-2xl border border-ink-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ink-950"
              rows={3}
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setUrgent((u) => !u)}
                className="rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-900"
              >
                {urgent ? "Urgent: ON" : "Urgent: OFF"}
              </button>
              <Button
                size="md"
                onClick={async () => {
                  const t = text.trim();
                  if (!t) return;
                  setText("");
                  await addNote(slug, t, urgent);
                  await mutate();
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {notes.map((n) => (
        <Card key={n.key}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-ink-950">{n.text}</div>
                <div className="mt-2 flex gap-2">
                  <Badge tone={n.urgent ? "urgent" : "neutral"}>{n.urgent ? "Urgent" : "Note"}</Badge>
                  <Badge tone={n.resolved ? "ok" : "neutral"}>{n.resolved ? "Resolved" : "Open"}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Button
              variant={n.resolved ? "ghost" : "primary"}
              onClick={async () => {
                await toggle(slug, n.key);
                await mutate();
              }}
            >
              {n.resolved ? "Re-open" : "Mark resolved"}
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}


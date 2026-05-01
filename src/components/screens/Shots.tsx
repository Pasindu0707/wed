"use client";

import { useEvent } from "@/components/useEvent";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

async function toggle(slug: string, key: string) {
  await fetch(`/api/events/${slug}/toggle`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "shots", key })
  });
}

export function Shots({ slug }: { slug: string }) {
  const { data, mutate, isLoading, error } = useEvent();

  if (isLoading) return <div className="text-sm text-ink-700">Loading…</div>;
  if (error) return <div className="text-sm text-red-700">Failed to load.</div>;

  const items = (data?.event?.shots ?? []) as any[];

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <Card key={it.key}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-ink-950">{it.title}</div>
                <div className="mt-1">
                  <Badge tone={it.priority === "must" ? "urgent" : "warn"}>
                    {it.priority === "must" ? "Must have" : "Nice to have"}
                  </Badge>
                </div>
              </div>
              <Badge tone={it.done ? "ok" : "neutral"}>{it.done ? "Done" : "Pending"}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <Button
              variant={it.done ? "ghost" : "primary"}
              onClick={async () => {
                await toggle(slug, it.key);
                await mutate();
              }}
            >
              {it.done ? "Undo" : "Mark captured"}
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}


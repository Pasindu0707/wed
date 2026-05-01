"use client";

import { useEvent } from "@/components/useEvent";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

async function toggle(slug: string, key: string) {
  await fetch(`/api/events/${slug}/toggle`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "timeline", key })
  });
}

export function Agenda({ slug }: { slug: string }) {
  const { data, mutate, isLoading, error } = useEvent();

  if (isLoading) return <div className="text-sm text-ink-700">Loading…</div>;
  if (error) return <div className="text-sm text-red-700">Failed to load.</div>;

  const items = (data?.event?.timeline ?? []) as any[];

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <Card key={it.key}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-ink-700">{it.time}</div>
                <div className="text-sm font-extrabold text-ink-950">{it.title}</div>
                {it.location ? <div className="mt-1 text-xs text-ink-700">{it.location}</div> : null}
                {it.details ? <div className="mt-1 text-xs text-ink-700">{it.details}</div> : null}
              </div>
              <Badge tone={it.done ? "ok" : "neutral"}>{it.done ? "Done" : "Pending"}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-ink-700">
                {it.contactName ? (
                  <div>
                    <span className="font-semibold text-ink-900">{it.contactName}</span>{" "}
                    {it.contactNumber ? <span>{it.contactNumber}</span> : null}
                  </div>
                ) : null}
                {it.vendor ? (
                  <div>
                    <span className="font-semibold text-ink-900">{it.vendor}</span>{" "}
                    {it.vendorNumber ? <span>{it.vendorNumber}</span> : null}
                  </div>
                ) : null}
              </div>
              <Button
                size="md"
                variant={it.done ? "ghost" : "primary"}
                onClick={async () => {
                  await toggle(slug, it.key);
                  await mutate();
                }}
              >
                {it.done ? "Undo" : "Mark done"}
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}


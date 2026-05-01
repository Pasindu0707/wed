"use client";

import { useEvent } from "@/components/useEvent";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

async function toggle(slug: string, key: string) {
  await fetch(`/api/events/${slug}/toggle`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "inventory", key })
  });
}

export function Handover({ slug }: { slug: string }) {
  const { data, mutate, isLoading, error } = useEvent();

  if (isLoading) return <div className="text-sm text-ink-700">Loading…</div>;
  if (error) return <div className="text-sm text-red-700">Failed to load.</div>;

  const items = (data?.event?.inventory ?? []) as any[];
  const done = items.filter((i) => i.handedOver).length;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-ink-950">Inventory handover</div>
            <Badge tone={done === items.length && items.length > 0 ? "ok" : "neutral"}>
              {done}/{items.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {items.map((it) => (
        <Card key={it.key}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-ink-950">{it.item}</div>
                {it.quantity ? <div className="mt-1 text-xs text-ink-700">{it.quantity}</div> : null}
                {it.notes ? <div className="mt-1 text-xs text-ink-700">{it.notes}</div> : null}
              </div>
              <Badge tone={it.handedOver ? "ok" : "neutral"}>{it.handedOver ? "Handed" : "Pending"}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <Button
              variant={it.handedOver ? "ghost" : "primary"}
              onClick={async () => {
                await toggle(slug, it.key);
                await mutate();
              }}
            >
              {it.handedOver ? "Undo" : "Mark handed over"}
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}


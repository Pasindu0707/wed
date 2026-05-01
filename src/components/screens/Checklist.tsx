"use client";

import { useEvent } from "@/components/useEvent";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

async function toggle(slug: string, sectionKey: string, itemKey: string) {
  await fetch(`/api/events/${slug}/toggle`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "checklist", sectionKey, itemKey })
  });
}

export function Checklist({ slug }: { slug: string }) {
  const { data, mutate, isLoading, error } = useEvent();

  if (isLoading) return <div className="text-sm text-ink-700">Loading…</div>;
  if (error) return <div className="text-sm text-red-700">Failed to load.</div>;

  const sections = (data?.event?.checklistSections ?? []) as any[];

  return (
    <div className="space-y-3">
      {sections.map((sec) => {
        const done = (sec.items ?? []).filter((i: any) => i.done).length;
        const total = (sec.items ?? []).length;
        return (
          <Card key={sec.key}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-extrabold text-ink-950">{sec.title}</div>
                <Badge tone={done === total && total > 0 ? "ok" : "neutral"}>
                  {done}/{total}
                </Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {(sec.items ?? []).map((it: any) => (
                  <div
                    key={it.key}
                    className="flex items-center justify-between gap-2 rounded-2xl border border-ink-200 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ink-950 truncate">{it.title}</div>
                      {it.notes ? <div className="mt-1 text-xs text-ink-700">{it.notes}</div> : null}
                    </div>
                    <Button
                      size="md"
                      variant={it.done ? "ghost" : "primary"}
                      onClick={async () => {
                        await toggle(slug, sec.key, it.key);
                        await mutate();
                      }}
                    >
                      {it.done ? "Undo" : "Done"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}


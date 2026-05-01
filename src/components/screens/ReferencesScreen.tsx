"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useReferences, type ReferenceImage, type ReferenceStatus } from "@/components/useReferences";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/toast/ToastProvider";

const statusTone: Record<ReferenceStatus, "neutral" | "ok" | "warn" | "urgent"> = {
  not_checked: "neutral",
  matches: "ok",
  issue: "urgent"
};

const statusLabel: Record<ReferenceStatus, string> = {
  not_checked: "Not checked",
  matches: "Matches",
  issue: "Issue"
};

async function patchRef(id: string, patch: Partial<ReferenceImage>) {
  const res = await fetch(`/api/reference-images/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error(await res.text());
}

export function ReferencesScreen({ weddingSlug }: { weddingSlug: string }) {
  const { data, error, isLoading, mutate } = useReferences(weddingSlug);
  const toast = useToast();

  const items = data?.items ?? [];

  const derived = useMemo(() => {
    const sorted = items.slice().sort((a, b) => a.area.localeCompare(b.area) || a.fileName.localeCompare(b.fileName));
    const issues = sorted.filter((i) => i.status === "issue").length;
    const matches = sorted.filter((i) => i.status === "matches").length;
    return { sorted, issues, matches, total: sorted.length };
  }, [items]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    );
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-ink-950">Reference checklist</div>
            <Badge tone="urgent">Error</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-ink-700">Couldn’t load reference images yet. Re-seed after adding the new model fields.</div>
          <div className="mt-3">
            <Button onClick={() => mutate()}>Retry</Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-ink-950">Reference checklist</div>
            <Badge tone={derived.issues > 0 ? "urgent" : "neutral"}>
              {derived.matches}/{derived.total} match
            </Badge>
          </div>
          <div className="mt-1 text-xs text-ink-700">
            Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="Matches" value={String(derived.matches)} tone="ok" />
            <MiniStat label="Issues" value={String(derived.issues)} tone="urgent" />
          </div>
          <div className="mt-2 text-xs text-ink-700">
            Images should be placed in <span className="font-semibold">/public/reference-images</span>.
          </div>
        </CardBody>
      </Card>

      <div className="space-y-2">
        {derived.sorted.map((it) => (
          <RefCard
            key={it._id}
            it={it}
            onPatch={async (patch) => {
              const prev = data;
              await mutate(
                (cur) => {
                  if (!cur) return cur;
                  return { items: cur.items.map((x) => (x._id === it._id ? { ...x, ...patch } : x)) };
                },
                { revalidate: false }
              );
              try {
                await patchRef(it._id, patch);
                await mutate();
                toast.push("Updated", "ok");
              } catch {
                await mutate(prev, { revalidate: false });
                toast.push("Update failed (offline?)", "error");
              }
            }}
          />
        ))}

        {derived.sorted.length === 0 ? (
          <div className="rounded-2xl border border-ink-200 bg-white px-4 py-4 text-sm text-ink-700">
            No reference image records yet. Run the seed.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "ok" | "urgent";
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white px-3 py-3">
      <div className="text-xs font-semibold text-ink-700">{label}</div>
      <div className={cn("mt-1 text-xl font-extrabold", tone === "ok" ? "text-emerald-700" : "text-red-700")}>{value}</div>
    </div>
  );
}

function RefCard({ it, onPatch }: { it: ReferenceImage; onPatch: (patch: Partial<ReferenceImage>) => Promise<void> }) {
  const [noteDraft, setNoteDraft] = useState(it.notes ?? "");

  useEffect(() => {
    setNoteDraft(it.notes ?? "");
  }, [it.notes]);

  const isIssue = it.status === "issue";

  return (
    <Card className={cn(isIssue ? "border-red-200" : undefined)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className={cn("text-sm font-extrabold", isIssue ? "text-red-800" : "text-ink-950")}>{it.fileName}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{it.area}</Badge>
              <Badge tone={statusTone[it.status]}>{statusLabel[it.status]}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-100">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={`/reference-images/${encodeURIComponent(it.fileName)}`}
              alt={it.description ?? it.fileName}
              fill
              className="object-cover"
              sizes="(max-width: 480px) 100vw, 480px"
              priority={false}
            />
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div>
            <div className="text-xs font-semibold text-ink-700">Expected details</div>
            <div className="mt-1 text-sm font-semibold text-ink-950">{it.expectedDetails ?? "—"}</div>
          </div>

          {it.checklistNotes ? (
            <div className="text-xs text-ink-700">
              <span className="font-semibold text-ink-900">Notes:</span> {it.checklistNotes}
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-2">
            <StatusBtn active={it.status === "not_checked"} onClick={() => onPatch({ status: "not_checked" })}>
              Not checked
            </StatusBtn>
            <StatusBtn ok active={it.status === "matches"} onClick={() => onPatch({ status: "matches" })}>
              Matches
            </StatusBtn>
            <StatusBtn danger active={it.status === "issue"} onClick={() => onPatch({ status: "issue" })}>
              Issue
            </StatusBtn>
          </div>

          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Issue notes (what’s wrong, who to call, fix needed)…"
            className={cn(
              "w-full resize-none rounded-2xl border bg-white px-3 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950",
              isIssue ? "border-red-200" : "border-ink-200"
            )}
            rows={3}
          />
          <Button size="md" onClick={() => onPatch({ notes: noteDraft.trim() || undefined })}>
            Save notes
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function StatusBtn({
  active,
  ok,
  danger,
  onClick,
  children
}: {
  active: boolean;
  ok?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 rounded-2xl text-xs font-extrabold",
        active ? "bg-ink-950 text-white" : "bg-white border border-ink-200 text-ink-900",
        ok && !active && "border-emerald-200 text-emerald-800",
        danger && !active && "border-red-200 text-red-800"
      )}
    >
      {children}
    </button>
  );
}


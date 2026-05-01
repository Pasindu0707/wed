"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTimeline, type TimelineItem, type TimelineStatus } from "@/components/useTimeline";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { nowMinutesLocal, parseTimeToMinutes } from "@/lib/time";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/toast/ToastProvider";

const statusTone: Record<TimelineStatus, "neutral" | "ok" | "warn" | "urgent"> = {
  pending: "neutral",
  done: "ok",
  delayed: "warn",
  issue: "urgent"
};

async function patchStatus(id: string, status: TimelineStatus) {
  const res = await fetch(`/api/timeline/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error(await res.text());
}

export function TimelineScreen({ weddingSlug }: { weddingSlug: string }) {
  const { data, error, isLoading, mutate } = useTimeline(weddingSlug);
  const toast = useToast();

  const derived = useMemo(() => {
    const items = (data?.items ?? []).slice();
    items.sort((a, b) => {
      const am = parseTimeToMinutes(a.time) ?? Number.MAX_SAFE_INTEGER;
      const bm = parseTimeToMinutes(b.time) ?? Number.MAX_SAFE_INTEGER;
      if (am !== bm) return am - bm;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });

    const now = nowMinutesLocal();
    const pendingNotDone = items.filter((i) => i.status !== "done");

    const next =
      pendingNotDone.find((i) => {
        const m = parseTimeToMinutes(i.time);
        return m !== null && m >= now;
      }) ?? pendingNotDone[0] ?? null;

    const current =
      next
        ? (() => {
            const nextM = parseTimeToMinutes(next.time);
            if (nextM === null) return null;
            const prev = items
              .filter((i) => {
                const m = parseTimeToMinutes(i.time);
                return m !== null && m <= nextM;
              })
              .slice(-1)[0];
            return prev ?? null;
          })()
        : null;

    return { items, current, next };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-ink-950">Timeline</div>
            <Badge tone="urgent">Error</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-ink-700">Couldn’t load timeline items yet.</div>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => mutate()}>Retry</Button>
            <Link
              className="inline-flex h-12 items-center justify-center rounded-xl border border-ink-200 px-4 text-base font-semibold"
              href={`/wedding/${weddingSlug}/timeline/edit`}
            >
              Add items
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sticky current/next */}
      <div className="sticky top-[56px] z-20">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-ink-950">Now / Next</div>
              <Link
                href={`/wedding/${weddingSlug}/timeline/edit`}
                className="rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-900"
              >
                Edit
              </Link>
            </div>
            <div className="mt-1 text-xs text-ink-700">
              Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid gap-2">
              <NowNextRow label="Now" it={derived.current} />
              <NowNextRow label="Next" it={derived.next} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* List */}
      <div className="space-y-2">
        {derived.items.map((it) => (
          <TimelineCard
            key={it._id}
            it={it}
            onSetStatus={async (s) => {
              // optimistic
              const prev = data;
              await mutate(
                (cur) => {
                  if (!cur) return cur;
                  return { items: cur.items.map((x) => (x._id === it._id ? { ...x, status: s } : x)) };
                },
                { revalidate: false }
              );
              try {
                await patchStatus(it._id, s);
                await mutate();
                toast.push("Updated", "ok");
              } catch {
                await mutate(prev, { revalidate: false });
                toast.push("Update failed (offline?)", "error");
              }
            }}
          />
        ))}

        {derived.items.length === 0 ? (
          <div className="rounded-2xl border border-ink-200 bg-white px-4 py-4 text-sm text-ink-700">
            No timeline items yet. Tap <span className="font-semibold">Edit</span> to add items manually.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NowNextRow({ label, it }: { label: "Now" | "Next"; it: TimelineItem | null }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-200 bg-white px-3 py-3">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-ink-700">{label}</div>
        {it ? (
          <>
            <div className="mt-0.5 text-sm font-extrabold text-ink-950 truncate">
              {it.time} • {it.title}
            </div>
            {it.location ? <div className="mt-1 text-xs text-ink-700 truncate">{it.location}</div> : null}
          </>
        ) : (
          <div className="mt-0.5 text-sm font-semibold text-ink-700">—</div>
        )}
      </div>
      {it ? <Badge tone={statusTone[it.status]}>{it.status}</Badge> : null}
    </div>
  );
}

function TimelineCard({ it, onSetStatus }: { it: TimelineItem; onSetStatus: (s: TimelineStatus) => void }) {
  const isProblem = it.status === "delayed" || it.status === "issue";
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white px-3 py-3",
        isProblem ? (it.status === "issue" ? "border-red-200" : "border-amber-200") : "border-ink-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-ink-700">{it.time}</div>
          <div className="text-sm font-extrabold text-ink-950">{it.title}</div>
          {it.location ? <div className="mt-1 text-xs text-ink-700">{it.location}</div> : null}
          {it.description ? <div className="mt-1 text-xs text-ink-700">{it.description}</div> : null}
          <div className="mt-2">
            <Badge tone={statusTone[it.status]}>{it.status}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <QuickBtn active={it.status === "pending"} onClick={() => onSetStatus("pending")}>
          Pending
        </QuickBtn>
        <QuickBtn active={it.status === "done"} onClick={() => onSetStatus("done")}>
          Done
        </QuickBtn>
        <QuickBtn warn active={it.status === "delayed"} onClick={() => onSetStatus("delayed")}>
          Delayed
        </QuickBtn>
        <QuickBtn danger active={it.status === "issue"} onClick={() => onSetStatus("issue")}>
          Issue
        </QuickBtn>
      </div>
    </div>
  );
}

function QuickBtn({
  active,
  warn,
  danger,
  onClick,
  children
}: {
  active: boolean;
  warn?: boolean;
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
        warn && !active && "border-amber-200 text-amber-800",
        danger && !active && "border-red-200 text-red-800"
      )}
    >
      {children}
    </button>
  );
}


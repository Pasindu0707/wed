"use client";

import { useMemo, useState } from "react";
import { useChecklist, type ChecklistItem, type ChecklistStatus } from "@/components/useChecklist";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/toast/ToastProvider";

const statusLabel: Record<ChecklistStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
  issue: "Issue"
};

const statusTone: Record<ChecklistStatus, "neutral" | "ok" | "warn" | "urgent"> = {
  pending: "neutral",
  in_progress: "warn",
  done: "ok",
  issue: "urgent"
};

type Filter = "all" | "pending" | "in_progress" | "done" | "issue" | "critical";

async function patchStatus(id: string, status: ChecklistStatus) {
  const res = await fetch(`/api/checklist/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error(await res.text());
}

async function patchNotes(id: string, notes: string | undefined) {
  const res = await fetch(`/api/checklist/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ notes })
  });
  if (!res.ok) throw new Error(await res.text());
}

export function ChecklistScreen({ weddingSlug }: { weddingSlug: string }) {
  const { data, error, isLoading, mutate } = useChecklist(weddingSlug);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const toast = useToast();

  const items = data?.items ?? [];

  const derived = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((it) => {
      const text =
        `${it.title} ${it.description ?? ""} ${it.notes ?? ""} ${it.assignedTo ?? ""} ${(it.imageRefs ?? []).join(" ")}`.toLowerCase();
      if (q && !text.includes(q)) return false;
      if (filter === "all") return true;
      if (filter === "critical") return it.priority === "critical" && it.status !== "done";
      return it.status === filter;
    });

    const bySection = new Map<string, ChecklistItem[]>();
    for (const it of filtered) {
      const arr = bySection.get(it.section) ?? [];
      arr.push(it);
      bySection.set(it.section, arr);
    }
    for (const [k, arr] of bySection) {
      arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      bySection.set(k, arr);
    }

    const allCount = items.length;
    const doneCount = items.filter((i) => i.status === "done").length;
    const progress = allCount === 0 ? 0 : Math.round((doneCount / allCount) * 100);
    const criticalPending = items.filter((i) => i.priority === "critical" && i.status !== "done");

    const sectionCounts = new Map<string, { done: number; total: number }>();
    for (const it of items) {
      const cur = sectionCounts.get(it.section) ?? { done: 0, total: 0 };
      cur.total += 1;
      if (it.status === "done") cur.done += 1;
      sectionCounts.set(it.section, cur);
    }

    return { filtered, bySection, progress, criticalPending, sectionCounts };
  }, [items, query, filter]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-12" />
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
            <div className="text-sm font-extrabold text-ink-950">Checklist</div>
            <Badge tone="urgent">Error</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-ink-700">Couldn’t load checklist. Check MongoDB and seed.</div>
          <div className="mt-3">
            <Button onClick={() => mutate()}>Retry</Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Big progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-ink-950">Wedding Day Progress</div>
            <Badge tone={derived.progress >= 90 ? "ok" : derived.progress >= 50 ? "warn" : "neutral"}>
              {derived.progress}%
            </Badge>
          </div>
          <div className="mt-1 text-xs text-ink-700">
            Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full bg-ink-950" style={{ width: `${derived.progress}%` }} />
          </div>
          <div className="mt-2 text-xs text-ink-700">
            {items.filter((i) => i.status === "done").length}/{items.length} done
          </div>
        </CardBody>
      </Card>

      {/* Sticky critical pending */}
      {derived.criticalPending.length > 0 ? (
        <div className="sticky top-[56px] z-20">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-extrabold text-ink-950">Critical pending</div>
                <Badge tone="urgent">{derived.criticalPending.length}</Badge>
              </div>
              <div className="mt-1 text-xs text-ink-700">Tap status to update instantly.</div>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {derived.criticalPending.slice(0, 3).map((it) => (
                  <MiniRow key={it._id} it={it} onSetStatus={(s) => onSetStatus(it, s)} />
                ))}
                {derived.criticalPending.length > 3 ? (
                  <div className="text-xs text-ink-700">+ {derived.criticalPending.length - 3} more</div>
                ) : null}
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {/* Search */}
      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search (title, desc, person, image ref)…"
          className="h-12 w-full rounded-2xl border border-ink-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
        />
      </div>

      <button
        type="button"
        onClick={() => setFilter("critical")}
        className="h-12 w-full rounded-2xl border border-red-200 bg-red-50 text-sm font-extrabold text-red-800"
      >
        Show only pending critical items
      </button>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
        <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
        <FilterChip label="Pending" active={filter === "pending"} onClick={() => setFilter("pending")} />
        <FilterChip label="In Progress" active={filter === "in_progress"} onClick={() => setFilter("in_progress")} />
        <FilterChip label="Done" active={filter === "done"} onClick={() => setFilter("done")} />
        <FilterChip label="Issues" active={filter === "issue"} onClick={() => setFilter("issue")} />
        <FilterChip label="Critical" active={filter === "critical"} onClick={() => setFilter("critical")} tone="urgent" />
      </div>

      {/* Grouped by section */}
      <div className="space-y-3">
        {Array.from(derived.bySection.entries()).map(([section, secItems]) => {
          const counts = derived.sectionCounts.get(section) ?? { done: 0, total: 0 };
          return (
            <Card key={section}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-ink-950">{prettySection(section)}</div>
                  <Badge tone={counts.done === counts.total && counts.total > 0 ? "ok" : "neutral"}>
                    {counts.done}/{counts.total}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {secItems.map((it) => (
                    <ChecklistCard
                      key={it._id}
                      it={it}
                      onSetStatus={(s) => onSetStatus(it, s)}
                      onSaveNotes={(notes) => onSaveNotes(it, notes)}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          );
        })}

        {derived.filtered.length === 0 ? (
          <div className="rounded-2xl border border-ink-200 bg-white px-4 py-4 text-sm text-ink-700">
            No items match your search/filter.
          </div>
        ) : null}
      </div>
    </div>
  );

  async function onSetStatus(it: ChecklistItem, next: ChecklistStatus) {
    if (it.priority === "critical" && next === "issue") {
      const ok = window.confirm("This is CRITICAL. Mark as ISSUE?");
      if (!ok) return;
    }

    const prev = data;
    await mutate(
      (cur) => {
        if (!cur) return cur;
        return {
          items: cur.items.map((x) => (x._id === it._id ? { ...x, status: next, updatedAt: new Date().toISOString() } : x))
        };
      },
      { revalidate: false }
    );

    try {
      await patchStatus(it._id, next);
      await mutate();
      toast.push("Updated", "ok");
    } catch {
      // rollback
      await mutate(prev, { revalidate: false });
      toast.push("Update failed (offline?)", "error");
    }
  }

  async function onSaveNotes(it: ChecklistItem, notes: string) {
    const prev = data;
    await mutate(
      (cur) => {
        if (!cur) return cur;
        return { items: cur.items.map((x) => (x._id === it._id ? { ...x, notes, updatedAt: new Date().toISOString() } : x)) };
      },
      { revalidate: false }
    );
    try {
      await patchNotes(it._id, notes.trim() || undefined);
      await mutate();
      toast.push("Notes saved", "ok");
    } catch {
      await mutate(prev, { revalidate: false });
      toast.push("Notes save failed", "error");
    }
  }
}

function prettySection(section: string) {
  if (section === "PhotoVideo") return "Photo / Video / Instagram";
  if (section === "FinalHandover") return "Final handover";
  if (section === "RobeShoot") return "Robe shoot";
  return section;
}

function FilterChip({
  label,
  active,
  onClick,
  tone
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: "urgent";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 shrink-0 rounded-full px-4 text-sm font-bold",
        active ? "bg-ink-950 text-white" : "bg-white text-ink-900 border border-ink-200",
        tone === "urgent" && !active && "border-red-200 text-red-800"
      )}
    >
      {label}
    </button>
  );
}

function PriorityBadge({ priority }: { priority: ChecklistItem["priority"] }) {
  if (priority === "critical") return <Badge tone="urgent">Critical</Badge>;
  if (priority === "high") return <Badge tone="warn">High</Badge>;
  if (priority === "medium") return <Badge tone="neutral">Medium</Badge>;
  return <Badge tone="neutral">Low</Badge>;
}

function ChecklistCard({
  it,
  onSetStatus,
  onSaveNotes
}: {
  it: ChecklistItem;
  onSetStatus: (next: ChecklistStatus) => void;
  onSaveNotes: (notes: string) => void;
}) {
  const [draft, setDraft] = useState(it.notes ?? "");
  return (
    <div className="rounded-2xl border border-ink-200 bg-white px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-ink-950">{it.title}</div>
          {it.description ? <div className="mt-1 text-xs text-ink-700">{it.description}</div> : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={it.priority} />
            <Badge tone={statusTone[it.status]}>{statusLabel[it.status]}</Badge>
            {it.dueTime ? <Badge tone="warn">Due {it.dueTime}</Badge> : null}
            {it.assignedTo ? <Badge tone="neutral">👤 {it.assignedTo}</Badge> : null}
          </div>
          {it.imageRefs?.length ? (
            <div className="mt-2 text-xs text-ink-700">
              <span className="font-semibold text-ink-900">Refs:</span> {it.imageRefs.join(", ")}
            </div>
          ) : null}
        </div>
      </div>

      {/* One-hand status selector */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        <StatusBtn active={it.status === "pending"} tone="neutral" onClick={() => onSetStatus("pending")}>
          Pending
        </StatusBtn>
        <StatusBtn active={it.status === "in_progress"} tone="warn" onClick={() => onSetStatus("in_progress")}>
          Doing
        </StatusBtn>
        <StatusBtn active={it.status === "done"} tone="ok" onClick={() => onSetStatus("done")}>
          Done
        </StatusBtn>
        <StatusBtn active={it.status === "issue"} tone="urgent" onClick={() => onSetStatus("issue")}>
          Issue
        </StatusBtn>
      </div>

      <div className="mt-3 grid gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Notes (quick reminders for this item)…"
          className="w-full resize-none rounded-2xl border border-ink-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
          rows={2}
        />
        <Button size="md" variant="ghost" onClick={() => onSaveNotes(draft)}>
          Save notes
        </Button>
      </div>
    </div>
  );
}

function StatusBtn({
  active,
  tone,
  onClick,
  children
}: {
  active: boolean;
  tone: "neutral" | "ok" | "warn" | "urgent";
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
        tone === "urgent" && !active && "border-red-200 text-red-800",
        tone === "warn" && !active && "border-amber-200 text-amber-800",
        tone === "ok" && !active && "border-emerald-200 text-emerald-800"
      )}
    >
      {children}
    </button>
  );
}

function MiniRow({ it, onSetStatus }: { it: ChecklistItem; onSetStatus: (next: ChecklistStatus) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-red-200 bg-white px-3 py-3">
      <div className="min-w-0">
        <div className="text-sm font-extrabold text-ink-950 truncate">{it.title}</div>
        {it.dueTime ? <div className="mt-1 text-xs text-ink-700">Due {it.dueTime}</div> : null}
      </div>
      <button
        type="button"
        onClick={() => onSetStatus(it.status === "done" ? "pending" : "done")}
        className="h-10 rounded-xl bg-ink-950 px-3 text-xs font-extrabold text-white"
      >
        Mark done
      </button>
    </div>
  );
}


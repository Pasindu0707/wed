"use client";

import { useMemo, useState } from "react";
import { useShots, type MediaShot, type ShotStatus } from "@/components/useShots";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/toast/ToastProvider";

const order = [
  "Decorations",
  "Couple Moments",
  "Ceremony",
  "Reception",
  "Speeches / Dances",
  "Vendors",
  "Critical Marketing Video"
] as const;

const statusTone: Record<ShotStatus, "neutral" | "ok" | "warn" | "urgent"> = {
  pending: "neutral",
  captured: "ok",
  missed: "urgent"
};

async function patchStatus(id: string, status: ShotStatus) {
  const res = await fetch(`/api/media-shots/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error(await res.text());
}

export function ShotsScreen({ weddingSlug }: { weddingSlug: string }) {
  const { data, error, isLoading, mutate } = useShots(weddingSlug);
  const [q, setQ] = useState("");
  const toast = useToast();

  const derived = useMemo(() => {
    const items = data?.items ?? [];
    const query = q.trim().toLowerCase();

    const filtered = query
      ? items.filter((s) => `${s.title} ${s.description ?? ""} ${s.notes ?? ""}`.toLowerCase().includes(query))
      : items;

    const groups = new Map<string, MediaShot[]>();
    for (const s of filtered) {
      const arr = groups.get(s.category) ?? [];
      arr.push(s);
      groups.set(s.category, arr);
    }

    for (const [k, arr] of groups) {
      arr.sort((a, b) => a.title.localeCompare(b.title));
      groups.set(k, arr);
    }

    const total = items.length;
    const captured = items.filter((i) => i.status === "captured").length;
    const pendingCritical = items.filter(
      (i) =>
        i.status === "pending" &&
        (i.category === "Critical Marketing Video" || i.title.toUpperCase().startsWith("CRITICAL"))
    );

    const pct = total === 0 ? 0 : Math.round((captured / total) * 100);

    return { items, filtered, groups, total, captured, pct, pendingCritical };
  }, [data, q]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-12" />
        <Skeleton className="h-44" />
        <Skeleton className="h-44" />
      </div>
    );
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-ink-950">Shot list</div>
            <Badge tone="urgent">Error</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-ink-700">Couldn’t load shots. Check MongoDB and re-seed.</div>
          <div className="mt-3">
            <Button onClick={() => mutate()}>Retry</Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-ink-950">Shot progress</div>
            <Badge tone={derived.pct >= 90 ? "ok" : derived.pct >= 50 ? "warn" : "neutral"}>{derived.pct}%</Badge>
          </div>
          <div className="mt-1 text-xs text-ink-700">
            Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full bg-ink-950" style={{ width: `${derived.pct}%` }} />
          </div>
          <div className="mt-2 text-xs text-ink-700">
            {derived.captured}/{derived.total} captured
          </div>
        </CardBody>
      </Card>

      {/* Sticky critical */}
      {derived.pendingCritical.length > 0 ? (
        <div className="sticky top-[56px] z-20">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-extrabold text-ink-950">Critical pending</div>
                <Badge tone="urgent">{derived.pendingCritical.length}</Badge>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {derived.pendingCritical.slice(0, 2).map((s) => (
                  <MiniCritical
                    key={s._id}
                    s={s}
                    onSet={async (next) => {
                      await setStatusOptimistic(s, next);
                    }}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {/* Search */}
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search shots…"
        className="h-12 w-full rounded-2xl border border-ink-200 bg-white px-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
      />

      {/* Groups */}
      <div className="space-y-3">
        {order.map((cat) => {
          const list = derived.groups.get(cat) ?? [];
          if (list.length === 0) return null;
          const done = list.filter((x) => x.status === "captured").length;
          return (
            <Card key={cat} className={cat === "Critical Marketing Video" ? "border-red-200" : undefined}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-ink-950">{cat}</div>
                  <Badge tone={done === list.length ? "ok" : "neutral"}>
                    {done}/{list.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-2">
                  {list.map((s) => (
                    <ShotCard key={s._id} s={s} onSet={(next) => setStatusOptimistic(s, next)} />
                  ))}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {derived.filtered.length === 0 ? (
        <div className="rounded-2xl border border-ink-200 bg-white px-4 py-4 text-sm text-ink-700">
          No shots match your search.
        </div>
      ) : null}
    </div>
  );

  async function setStatusOptimistic(s: MediaShot, next: ShotStatus) {
    const isCritical = s.category === "Critical Marketing Video" || s.title.toUpperCase().startsWith("CRITICAL");
    if (isCritical && next === "missed") {
      const ok = window.confirm("This is CRITICAL. Mark as MISSED?");
      if (!ok) return;
    }
    const prev = data;
    await mutate(
      (cur) => {
        if (!cur) return cur;
        return { items: cur.items.map((x) => (x._id === s._id ? { ...x, status: next } : x)) };
      },
      { revalidate: false }
    );
    try {
      await patchStatus(s._id, next);
      await mutate();
      toast.push("Updated", "ok");
    } catch {
      await mutate(prev, { revalidate: false });
      toast.push("Update failed (offline?)", "error");
    }
  }
}

function ShotCard({ s, onSet }: { s: MediaShot; onSet: (next: ShotStatus) => void }) {
  const isCritical = s.category === "Critical Marketing Video" || s.title.toUpperCase().startsWith("CRITICAL");
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white px-3 py-3",
        isCritical ? "border-red-200" : s.status === "missed" ? "border-red-200" : "border-ink-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={cn("text-sm font-extrabold", isCritical ? "text-red-800" : "text-ink-950")}>{s.title}</div>
          {s.description ? <div className="mt-1 text-xs text-ink-700">{s.description}</div> : null}
          {s.notes ? <div className="mt-1 text-xs text-ink-700">{s.notes}</div> : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {isCritical ? <Badge tone="urgent">CRITICAL</Badge> : null}
            <Badge tone={statusTone[s.status]}>{s.status}</Badge>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatusBtn active={s.status === "pending"} onClick={() => onSet("pending")}>
          Pending
        </StatusBtn>
        <StatusBtn ok active={s.status === "captured"} onClick={() => onSet("captured")}>
          Captured
        </StatusBtn>
        <StatusBtn danger active={s.status === "missed"} onClick={() => onSet("missed")}>
          Missed
        </StatusBtn>
      </div>
    </div>
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

function MiniCritical({ s, onSet }: { s: MediaShot; onSet: (next: ShotStatus) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-red-200 bg-white px-3 py-3">
      <div className="min-w-0">
        <div className="text-sm font-extrabold text-red-800 truncate">{s.title}</div>
      </div>
      <button
        type="button"
        onClick={() => onSet("captured")}
        className="h-10 rounded-xl bg-ink-950 px-3 text-xs font-extrabold text-white"
      >
        Mark captured
      </button>
    </div>
  );
}


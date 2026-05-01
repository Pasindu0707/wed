"use client";

import { useEffect, useMemo, useState } from "react";
import { useInventory, type InventoryItem, type InventoryStatus } from "@/components/useInventory";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/toast/ToastProvider";

const statusTone: Record<InventoryStatus, "neutral" | "ok" | "warn" | "urgent"> = {
  handed_over: "ok",
  pending: "neutral",
  returned: "warn",
  missing: "urgent"
};

const statusLabel: Record<InventoryStatus, string> = {
  handed_over: "Handed over",
  pending: "Pending",
  returned: "Returned",
  missing: "Missing"
};

async function patchItem(id: string, patch: Partial<InventoryItem>) {
  const res = await fetch(`/api/inventory/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(patch)
  });
  if (!res.ok) throw new Error(await res.text());
}

function lsKey(slug: string) {
  return `wedding:${slug}:inventory:endChecklist:v1`;
}

type EndChecklistState = {
  leftoverBottlesHandled: boolean;
  hotelPhotosAndBillsCaptured: boolean;
};

export function InventoryScreen({ weddingSlug }: { weddingSlug: string }) {
  const { data, error, isLoading, mutate } = useInventory(weddingSlug);
  const toast = useToast();

  const [endState, setEndState] = useState<EndChecklistState>({
    leftoverBottlesHandled: false,
    hotelPhotosAndBillsCaptured: false
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(lsKey(weddingSlug));
      if (raw) setEndState(JSON.parse(raw) as EndChecklistState);
    } catch {
      // ignore
    }
  }, [weddingSlug]);

  useEffect(() => {
    try {
      localStorage.setItem(lsKey(weddingSlug), JSON.stringify(endState));
    } catch {
      // ignore
    }
  }, [weddingSlug, endState]);

  const items = data?.items ?? [];

  const derived = useMemo(() => {
    const sorted = items.slice().sort((a, b) => a.itemName.localeCompare(b.itemName));
    const handed = sorted.filter((i) => i.status === "handed_over").length;
    const pending = sorted.filter((i) => i.status === "pending").length;
    const missing = sorted.filter((i) => i.status === "missing").length;
    return { sorted, handed, pending, missing, total: sorted.length };
  }, [items]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-24" />
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
            <div className="text-sm font-extrabold text-ink-950">Inventory</div>
            <Badge tone="urgent">Error</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-ink-700">Couldn’t load inventory items. Check MongoDB and seed.</div>
          <div className="mt-3">
            <Button onClick={() => mutate()}>Retry</Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-ink-950">Handover status</div>
            <Badge tone={derived.missing > 0 ? "urgent" : derived.pending > 0 ? "warn" : "ok"}>
              {derived.handed}/{derived.total} handed
            </Badge>
          </div>
          <div className="mt-1 text-xs text-ink-700">
            Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Handed" value={String(derived.handed)} tone="ok" />
            <MiniStat label="Pending" value={String(derived.pending)} tone="warn" />
            <MiniStat label="Missing" value={String(derived.missing)} tone="urgent" />
          </div>
        </CardBody>
      </Card>

      {/* Big warning card */}
      <Card className="border-amber-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-ink-950">Important</div>
            <Badge tone="warn">Do not skip</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="text-sm font-semibold text-ink-950">
            If handing over anything else to hotel, get photos and bill/inventory from them.
          </div>
        </CardBody>
      </Card>

      {/* List items */}
      <div className="space-y-2">
        {derived.sorted.map((it) => (
          <InventoryCard
            key={it._id}
            it={it}
            onPatch={async (patch) => {
              const prev = data;
              await mutate(
                (cur) => {
                  if (!cur) return cur;
                  return {
                    items: cur.items.map((x) =>
                      x._id === it._id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x
                    )
                  };
                },
                { revalidate: false }
              );
              try {
                await patchItem(it._id, patch);
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
            No inventory items yet. Run the seed.
          </div>
        ) : null}
      </div>

      {/* Final reminders */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-ink-950">Final handover reminders</div>
            <Badge tone="urgent">End of night</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            <ToggleRow
              checked={endState.leftoverBottlesHandled}
              onToggle={() => setEndState((s) => ({ ...s, leftoverBottlesHandled: !s.leftoverBottlesHandled }))}
              title="Collect / hand over leftover bottles"
              subtitle="Make sure nothing is left behind at the bar."
            />
            <ToggleRow
              checked={endState.hotelPhotosAndBillsCaptured}
              onToggle={() =>
                setEndState((s) => ({ ...s, hotelPhotosAndBillsCaptured: !s.hotelPhotosAndBillsCaptured }))
              }
              title="Photos + bill/inventory captured for any extra handover"
              subtitle="If anything new is handed over later, document it."
            />
          </div>
          <div className="mt-3 text-xs text-ink-700">
            These two checkboxes are saved on this device (so you can tick them during the function).
          </div>
        </CardBody>
      </Card>
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
  tone: "ok" | "warn" | "urgent";
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white px-3 py-3">
      <div className="text-xs font-semibold text-ink-700">{label}</div>
      <div className={cn("mt-1 text-xl font-extrabold", tone === "ok" ? "text-emerald-700" : tone === "warn" ? "text-amber-800" : "text-red-700")}>
        {value}
      </div>
    </div>
  );
}

function InventoryCard({
  it,
  onPatch
}: {
  it: InventoryItem;
  onPatch: (patch: Partial<InventoryItem>) => Promise<void>;
}) {
  const [noteDraft, setNoteDraft] = useState(it.notes ?? "");

  useEffect(() => {
    setNoteDraft(it.notes ?? "");
  }, [it.notes]);

  return (
    <div className={cn("rounded-2xl border bg-white px-3 py-3", it.status === "missing" ? "border-red-200" : it.status === "returned" ? "border-amber-200" : "border-ink-200")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-ink-950">{it.itemName}</div>
          <div className="mt-1 text-xs text-ink-700">
            {it.quantity ?? ""} {it.unit ?? ""} {it.handedOverTo ? `• to ${it.handedOverTo}` : ""}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={statusTone[it.status]}>{statusLabel[it.status]}</Badge>
            {it.photoRequired ? <Badge tone="warn">Photo required</Badge> : null}
            {it.billRequired ? <Badge tone="warn">Bill required</Badge> : null}
          </div>
        </div>
      </div>

      {/* One-hand status buttons */}
      <div className="mt-3 grid grid-cols-4 gap-2">
        <StatusBtn active={it.status === "handed_over"} onClick={() => onPatch({ status: "handed_over" })}>
          Handed
        </StatusBtn>
        <StatusBtn active={it.status === "pending"} onClick={() => onPatch({ status: "pending" })}>
          Pending
        </StatusBtn>
        <StatusBtn warn active={it.status === "returned"} onClick={() => onPatch({ status: "returned" })}>
          Returned
        </StatusBtn>
        <StatusBtn danger active={it.status === "missing"} onClick={() => onPatch({ status: "missing" })}>
          Missing
        </StatusBtn>
      </div>

      {/* Notes + indicators */}
      <div className="mt-3 grid gap-2">
        <textarea
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          placeholder="Notes (who took it, where kept, bill received, etc)…"
          className="w-full resize-none rounded-2xl border border-ink-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ink-950"
          rows={2}
        />
        <div className="grid grid-cols-3 gap-2">
          <Button
            size="md"
            variant="ghost"
            onClick={() => onPatch({ photoRequired: !it.photoRequired })}
          >
            {it.photoRequired ? "Photo: ON" : "Photo: OFF"}
          </Button>
          <Button
            size="md"
            variant="ghost"
            onClick={() => onPatch({ billRequired: !it.billRequired })}
          >
            {it.billRequired ? "Bill: ON" : "Bill: OFF"}
          </Button>
          <Button
            size="md"
            onClick={() => onPatch({ notes: noteDraft.trim() || undefined })}
          >
            Save note
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusBtn({
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

function ToggleRow({
  checked,
  onToggle,
  title,
  subtitle
}: {
  checked: boolean;
  onToggle: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full rounded-2xl border px-3 py-3 text-left",
        checked ? "border-emerald-200 bg-emerald-50" : "border-ink-200 bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-ink-950">{title}</div>
          <div className="mt-1 text-xs text-ink-700">{subtitle}</div>
        </div>
        <Badge tone={checked ? "ok" : "neutral"}>{checked ? "Done" : "Open"}</Badge>
      </div>
    </button>
  );
}


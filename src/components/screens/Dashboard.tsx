"use client";

import { useMemo } from "react";
import { useEvent } from "@/components/useEvent";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export function Dashboard() {
  const { data, error, isLoading } = useEvent();

  const stats = useMemo(() => {
    const event = data?.event;
    if (!event) return null;

    const checklistItems =
      event.checklistSections?.flatMap((s: any) => s.items ?? []) ?? [];
    const checklistDone = checklistItems.filter((i: any) => i.done).length;

    const timelineDone = (event.timeline ?? []).filter((i: any) => i.done).length;
    const inventoryDone = (event.inventory ?? []).filter((i: any) => i.handedOver).length;
    const urgentOpen = (event.notes ?? []).filter((n: any) => n.urgent && !n.resolved).length;

    return {
      coupleName: event.coupleName as string,
      dateISO: event.dateISO as string,
      checklistDone,
      checklistTotal: checklistItems.length,
      timelineDone,
      timelineTotal: (event.timeline ?? []).length,
      inventoryDone,
      inventoryTotal: (event.inventory ?? []).length,
      urgentOpen
    };
  }, [data]);

  if (isLoading) return <StatusCard title="Loading…" tone="neutral" />;
  if (error) return <StatusCard title="Cannot load event" tone="urgent" subtitle="Check MongoDB + env vars." />;
  if (!stats) return <StatusCard title="No event data" tone="warn" subtitle="Seed the default event once, then reload." />;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-base font-bold text-ink-950 truncate">{stats.coupleName}</div>
              <div className="text-sm text-ink-700">Wedding day • {stats.dateISO}</div>
            </div>
            <Badge tone={stats.urgentOpen > 0 ? "urgent" : "ok"}>{stats.urgentOpen} urgent</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Checklist" value={`${stats.checklistDone}/${stats.checklistTotal}`} />
            <Metric label="Agenda" value={`${stats.timelineDone}/${stats.timelineTotal}`} />
            <Metric label="Handover" value={`${stats.inventoryDone}/${stats.inventoryTotal}`} />
            <Metric label="Next" value="Tap Agenda" />
          </div>
        </CardBody>
      </Card>

      <QuickLinks />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white px-3 py-3">
      <div className="text-xs font-semibold text-ink-700">{label}</div>
      <div className="mt-1 text-xl font-extrabold tracking-tight text-ink-950">{value}</div>
    </div>
  );
}

function QuickLinks() {
  const links = [
    { href: "/agenda", label: "Full timeline / agenda" },
    { href: "/checklist", label: "Checklist by section" },
    { href: "/handover", label: "Inventory handover" },
    { href: "/shots", label: "Photo/video shot list" },
    { href: "/vendors", label: "Vendor/decor references" },
    { href: "/notes", label: "Notes / urgent reminders" }
  ];
  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-bold text-ink-950">Quick actions</div>
      </CardHeader>
      <CardBody>
        <div className="grid gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-2xl border border-ink-200 bg-white px-4 py-4 text-sm font-semibold text-ink-950"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}

function StatusCard({
  title,
  subtitle,
  tone
}: {
  title: string;
  subtitle?: string;
  tone: "neutral" | "warn" | "urgent";
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-ink-950">{title}</div>
          <Badge tone={tone === "urgent" ? "urgent" : tone === "warn" ? "warn" : "neutral"}>{tone}</Badge>
        </div>
      </CardHeader>
      {subtitle ? (
        <CardBody>
          <div className="text-sm text-ink-700">{subtitle}</div>
        </CardBody>
      ) : null}
    </Card>
  );
}


"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useWeddingBySlug } from "@/components/useWeddingBySlug";
import { useChecklist } from "@/components/useChecklist";
import { useTimeline } from "@/components/useTimeline";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { nowMinutesLocal, parseTimeToMinutes } from "@/lib/time";
import { Skeleton } from "@/components/ui/Skeleton";

export function HomeDashboard({ weddingSlug }: { weddingSlug: string }) {
  const weddingQ = useWeddingBySlug(weddingSlug);
  const checklistQ = useChecklist(weddingSlug);
  const timelineQ = useTimeline(weddingSlug);

  const derived = useMemo(() => {
    const wedding = weddingQ.data?.wedding;
    const checklist = checklistQ.data?.items ?? [];
    const timeline = (timelineQ.data?.items ?? []).slice();

    const checklistDone = checklist.filter((c) => c.status === "done").length;
    const checklistTotal = checklist.length;
    const checklistPct = checklistTotal === 0 ? 0 : Math.round((checklistDone / checklistTotal) * 100);

    const criticalPending = checklist.filter((c) => c.priority === "critical" && c.status !== "done");

    timeline.sort((a, b) => {
      const am = parseTimeToMinutes(a.time) ?? 1e9;
      const bm = parseTimeToMinutes(b.time) ?? 1e9;
      if (am !== bm) return am - bm;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    });

    const now = nowMinutesLocal();
    const nextTimeline =
      timeline.find((t) => t.status !== "done" && (parseTimeToMinutes(t.time) ?? 1e9) >= now) ??
      timeline.find((t) => t.status !== "done") ??
      null;

    const mapUrls = {
      suhashi: wedding?.locations.find((l) => l.name.toLowerCase().includes("suhashi"))?.mapUrl,
      darshana: wedding?.locations.find((l) => l.name.toLowerCase().includes("darshana"))?.mapUrl,
      church:
        wedding?.locations.find((l) => l.type.toLowerCase().includes("church"))?.mapUrl ??
        "https://www.google.com/maps/search/?api=1&query=St+Mary%E2%80%99s+Church+Negombo",
      hotel:
        wedding?.locations.find((l) => l.type.toLowerCase().includes("hotel"))?.mapUrl ??
        "https://www.google.com/maps/search/?api=1&query=Suriya+Resort"
    };

    return { wedding, checklistPct, checklistDone, checklistTotal, criticalPending, nextTimeline, mapUrls };
  }, [weddingQ.data, checklistQ.data, timelineQ.data]);

  const base = `/wedding/${weddingSlug}`;

  if (weddingQ.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    );
  }
  if (weddingQ.error) return <div className="text-sm text-red-700">Failed to load wedding.</div>;
  if (!derived.wedding) return <div className="text-sm text-ink-700">No wedding found for `{weddingSlug}`.</div>;

  const w = derived.wedding;

  return (
    <div className="space-y-3">
      {/* Wedding summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-lg font-extrabold text-ink-950 truncate">{w.coupleName}</div>
              <div className="mt-1 text-sm text-ink-700">2nd May 2026</div>
            </div>
            <Badge tone={derived.criticalPending.length > 0 ? "urgent" : "ok"}>
              {derived.criticalPending.length} critical
            </Badge>
          </div>
          <div className="mt-1 text-xs text-ink-700">
            Live sync every 20s • Last updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-2 text-sm">
            <Row label="Church" value={w.churchName} />
            <Row label="Reception" value={w.hotelName} />
          </div>
        </CardBody>
      </Card>

      {/* Map buttons */}
      <Card>
        <CardHeader>
          <div className="text-sm font-extrabold text-ink-950">Quick maps</div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-2">
            <MapBtn label="Suhashi" href={derived.mapUrls.suhashi} />
            <MapBtn label="Darshana" href={derived.mapUrls.darshana} />
            <MapBtn label="Church" href={derived.mapUrls.church} />
            <MapBtn label="Hotel" href={derived.mapUrls.hotel} />
          </div>
        </CardBody>
      </Card>

      {/* Overall checklist progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-ink-950">Overall checklist</div>
            <Badge tone={derived.checklistPct >= 90 ? "ok" : derived.checklistPct >= 50 ? "warn" : "neutral"}>
              {derived.checklistPct}%
            </Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="h-3 w-full overflow-hidden rounded-full bg-ink-100">
            <div className="h-full bg-ink-950" style={{ width: `${derived.checklistPct}%` }} />
          </div>
          <div className="mt-2 text-xs text-ink-700">
            {derived.checklistDone}/{derived.checklistTotal} done
          </div>
        </CardBody>
      </Card>

      {/* Critical pending */}
      {derived.criticalPending.length > 0 ? (
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold text-ink-950">Critical pending</div>
              <Badge tone="urgent">{derived.criticalPending.length}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {derived.criticalPending.slice(0, 4).map((c) => (
                <div key={c._id} className="rounded-2xl border border-red-200 bg-white px-3 py-3">
                  <div className="text-sm font-extrabold text-red-800">{c.title}</div>
                  {c.dueTime ? <div className="mt-1 text-xs text-ink-700">Due {c.dueTime}</div> : null}
                </div>
              ))}
              <Link
                href={`${base}/checklist?filter=critical`}
                className="block rounded-2xl border border-ink-200 bg-white px-4 py-4 text-center text-sm font-extrabold text-ink-950"
              >
                Open critical checklist
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : null}

      {/* Next timeline item */}
      <Card className={derived.nextTimeline?.status === "issue" ? "border-red-200" : derived.nextTimeline?.status === "delayed" ? "border-amber-200" : undefined}>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-extrabold text-ink-950">Next timeline item</div>
            <Link
              href={`${base}/timeline`}
              className="rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-900"
            >
              Open
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {derived.nextTimeline ? (
            <div className="rounded-2xl border border-ink-200 bg-white px-3 py-3">
              <div className="text-xs font-semibold text-ink-700">{derived.nextTimeline.time}</div>
              <div className="text-sm font-extrabold text-ink-950">{derived.nextTimeline.title}</div>
              {derived.nextTimeline.location ? <div className="mt-1 text-xs text-ink-700">{derived.nextTimeline.location}</div> : null}
              {derived.nextTimeline.description ? <div className="mt-1 text-xs text-ink-700">{derived.nextTimeline.description}</div> : null}
              <div className="mt-2">
                <Badge tone={derived.nextTimeline.status === "done" ? "ok" : derived.nextTimeline.status === "pending" ? "neutral" : derived.nextTimeline.status === "delayed" ? "warn" : "urgent"}>
                  {derived.nextTimeline.status}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-sm text-ink-700">No timeline items yet.</div>
          )}
        </CardBody>
      </Card>

      {/* Quick links */}
      <Card>
        <CardHeader>
          <div className="text-sm font-extrabold text-ink-950">Quick links</div>
        </CardHeader>
        <CardBody>
          <div className="grid gap-2">
            <QuickLink href={`${base}/checklist`} label="Checklist" />
            <QuickLink href={`${base}/timeline`} label="Timeline" />
            <QuickLink href={`${base}/inventory`} label="Inventory" />
            <QuickLink href={`${base}/shots`} label="Shots" />
            <QuickLink href={`${base}/references`} label="References" />
            <QuickLink href={`${base}/notes`} label="Notes" />
          </div>
        </CardBody>
      </Card>

      {/* Urgent reminder cards */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-ink-950">Urgent reminders</div>
            <Badge tone="urgent">Read</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            <Reminder text="Seating plan should always be in our hand." />
            <Reminder text="Confirm hotel setup around 5:45 PM." />
            <Reminder text="If 75% guests are in hall, couple enters at 7:00 PM sharp." />
            <Reminder text="Get pen drive in the morning." />
            <Reminder text="Check laptop, videos, and sound tracks." />
            <Reminder text="Get recommendation video from couple." />
            <Reminder text="Get photos and bill/inventory for extra hotel handovers." />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="text-xs font-semibold text-ink-700">{label}</div>
      <div className="text-sm font-extrabold text-ink-950 text-right">{value}</div>
    </div>
  );
}

function MapBtn({ label, href }: { label: string; href?: string }) {
  return (
    <a
      href={href ?? "#"}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "flex h-12 items-center justify-center rounded-2xl border border-ink-200 bg-white text-sm font-extrabold text-ink-950",
        !href && "opacity-50 pointer-events-none"
      )}
    >
      {label}
    </a>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-ink-200 bg-white px-4 py-4 text-sm font-extrabold text-ink-950"
    >
      {label}
    </Link>
  );
}

function Reminder({ text }: { text: string }) {
  return <div className="rounded-2xl border border-red-200 bg-white px-3 py-3 text-sm font-semibold text-ink-950">{text}</div>;
}


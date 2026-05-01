import { ClientShell } from "@/components/ClientShell";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export default function Page() {
  const slug = process.env.NEXT_PUBLIC_EVENT_SLUG || "suhashi-darshana-2026-05-02";
  const shareUrl = `/${""}?event=${encodeURIComponent(slug)}`;

  return (
    <ClientShell title="Shared link">
      <div className="space-y-3">
        <Card>
          <CardHeader>
            <div className="text-sm font-extrabold text-ink-950">Event slug</div>
          </CardHeader>
          <CardBody>
            <div className="rounded-2xl border border-ink-200 bg-white px-3 py-3 text-sm font-semibold text-ink-950">
              {slug}
            </div>
            <div className="mt-2 text-xs text-ink-700">
              For now this app uses a single configured event slug via <span className="font-semibold">NEXT_PUBLIC_EVENT_SLUG</span>.
              Next step is true “unguessable” shared links like <span className="font-semibold">/e/&lt;slug&gt;</span>.
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-extrabold text-ink-950">Share link (placeholder)</div>
          </CardHeader>
          <CardBody>
            <div className="rounded-2xl border border-ink-200 bg-white px-3 py-3 text-sm text-ink-950 break-all">
              {shareUrl}
            </div>
          </CardBody>
        </Card>
      </div>
    </ClientShell>
  );
}


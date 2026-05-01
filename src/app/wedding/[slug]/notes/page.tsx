import { WeddingShell } from "@/components/WeddingShell";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <WeddingShell slug={params.slug} title="Notes" subtitle="Coming next">
      <div className="rounded-2xl border border-ink-200 bg-white px-4 py-4 text-sm text-ink-700">
        Notes will be wired to a dedicated Notes model next.
      </div>
    </WeddingShell>
  );
}


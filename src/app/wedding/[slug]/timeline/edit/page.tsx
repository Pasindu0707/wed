import { WeddingShell } from "@/components/WeddingShell";
import { TimelineEditor } from "@/components/screens/TimelineEditor";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <WeddingShell slug={params.slug} title="Timeline editor" subtitle="Admin mode">
      <TimelineEditor weddingSlug={params.slug} />
    </WeddingShell>
  );
}


import { WeddingShell } from "@/components/WeddingShell";
import { TimelineScreen } from "@/components/screens/TimelineScreen";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <WeddingShell slug={params.slug} title="Timeline" subtitle="Live agenda">
      <TimelineScreen weddingSlug={params.slug} />
    </WeddingShell>
  );
}


import { WeddingShell } from "@/components/WeddingShell";
import { ShotsScreen } from "@/components/screens/ShotsScreen";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <WeddingShell slug={params.slug} title="Photo / video shots" subtitle="Capture list">
      <ShotsScreen weddingSlug={params.slug} />
    </WeddingShell>
  );
}


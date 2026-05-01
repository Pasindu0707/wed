import { WeddingShell } from "@/components/WeddingShell";
import { ReferencesScreen } from "@/components/screens/ReferencesScreen";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <WeddingShell slug={params.slug} title="Reference checklist" subtitle="Verify vs expected">
      <ReferencesScreen weddingSlug={params.slug} />
    </WeddingShell>
  );
}


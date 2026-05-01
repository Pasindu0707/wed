import { WeddingShell } from "@/components/WeddingShell";
import { ChecklistScreen } from "@/components/screens/ChecklistScreen";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <WeddingShell slug={params.slug} title="Checklist" subtitle="One-hand mode">
      <ChecklistScreen weddingSlug={params.slug} />
    </WeddingShell>
  );
}


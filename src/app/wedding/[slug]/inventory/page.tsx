import { WeddingShell } from "@/components/WeddingShell";
import { InventoryScreen } from "@/components/screens/InventoryScreen";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <WeddingShell slug={params.slug} title="Inventory handover" subtitle="Suriya Resort">
      <InventoryScreen weddingSlug={params.slug} />
    </WeddingShell>
  );
}


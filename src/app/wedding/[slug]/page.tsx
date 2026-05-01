import { WeddingShell } from "@/components/WeddingShell";
import { HomeDashboard } from "@/components/screens/HomeDashboard";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <WeddingShell slug={params.slug} title="Wedding dashboard" subtitle="Wedding-day control center">
      <HomeDashboard weddingSlug={params.slug} />
    </WeddingShell>
  );
}


import { WeddingShell } from "@/components/WeddingShell";
import { HomeDashboard } from "@/components/screens/HomeDashboard";

export default function Page() {
  const slug = "suhashi-darshana";
  return (
    <WeddingShell slug={slug} title="Wedding dashboard" subtitle="Wedding-day control center">
      <HomeDashboard weddingSlug={slug} />
    </WeddingShell>
  );
}


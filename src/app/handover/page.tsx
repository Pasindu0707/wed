import { ClientShell } from "@/components/ClientShell";
import { Handover } from "@/components/screens/Handover";
import { envEventSlug } from "@/lib/runtime";

export default function Page() {
  const slug = envEventSlug();
  return (
    <ClientShell title="Inventory handover">
      <Handover slug={slug} />
    </ClientShell>
  );
}


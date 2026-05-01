import { ClientShell } from "@/components/ClientShell";
import { Agenda } from "@/components/screens/Agenda";
import { envEventSlug } from "@/lib/runtime";

export default function Page() {
  const slug = envEventSlug();
  return (
    <ClientShell title="Full timeline / agenda">
      <Agenda slug={slug} />
    </ClientShell>
  );
}


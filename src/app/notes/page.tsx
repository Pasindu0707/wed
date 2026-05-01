import { ClientShell } from "@/components/ClientShell";
import { Notes } from "@/components/screens/Notes";
import { envEventSlug } from "@/lib/runtime";

export default function Page() {
  const slug = envEventSlug();
  return (
    <ClientShell title="Notes / urgent reminders">
      <Notes slug={slug} />
    </ClientShell>
  );
}


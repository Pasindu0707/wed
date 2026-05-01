import { ClientShell } from "@/components/ClientShell";
import { Vendors } from "@/components/screens/Vendors";
import { envEventSlug } from "@/lib/runtime";

export default function Page() {
  const slug = envEventSlug();
  return (
    <ClientShell title="Vendor / decor references">
      <Vendors slug={slug} />
    </ClientShell>
  );
}


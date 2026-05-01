"use client";

import { usePathname } from "next/navigation";
import { BottomNav, TopBar } from "./Nav";

export function ClientShell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-dvh">
      <TopBar title={title} />
      <main className="mx-auto max-w-md px-4 pb-28 pt-4">{children}</main>
      <BottomNav pathname={pathname} />
    </div>
  );
}


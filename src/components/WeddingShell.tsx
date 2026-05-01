"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { ShareButton } from "@/components/share/ShareButton";
import { CriticalBanner } from "@/components/banners/CriticalBanner";

const nav = [
  { href: "", label: "Home" },
  { href: "/checklist", label: "Checklist" },
  { href: "/timeline", label: "Timeline" },
  { href: "/inventory", label: "Inventory" },
  { href: "/shots", label: "Shots" },
  { href: "/references", label: "Refs" },
  { href: "/notes", label: "Notes" }
];

export function WeddingShell({
  slug,
  title,
  subtitle,
  children
}: {
  slug: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/wedding/${slug}`;

  return (
    <div className="min-h-dvh">
      <div className="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-ink-950 truncate">{title}</div>
            <div className="text-xs text-ink-700 truncate">{subtitle ?? slug}</div>
          </div>
          <ShareButton url={base} />
        </div>
      </div>
      <div className="sticky top-[56px] z-20">
        <CriticalBanner weddingSlug={slug} />
      </div>

      <main className="mx-auto max-w-md px-4 pb-28 pt-4">{children}</main>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-ink-200 bg-white/90 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 py-2">
          {nav.slice(0, 4).map((item) => (
            <NavItem
              key={item.label}
              href={`${base}${item.href}`}
              label={item.label}
              active={pathname === `${base}${item.href}`}
            />
          ))}
        </div>
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1 px-2 pb-2">
          {nav.slice(4).map((item) => (
            <NavItem
              key={item.label}
              href={`${base}${item.href}`}
              label={item.label}
              active={pathname === `${base}${item.href}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavItem({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-center rounded-xl px-2 py-3 text-xs font-semibold",
        active ? "bg-ink-950 text-white" : "bg-white text-ink-900 border border-ink-200"
      )}
    >
      {label}
    </Link>
  );
}


import Link from "next/link";
import { cn } from "@/lib/cn";

const nav = [
  { href: "/", label: "Home" },
  { href: "/agenda", label: "Agenda" },
  { href: "/checklist", label: "Checklist" },
  { href: "/handover", label: "Handover" },
  { href: "/shots", label: "Shots" },
  { href: "/vendors", label: "Vendors" },
  { href: "/notes", label: "Notes" }
];

export function TopBar({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink-950 truncate">{title}</div>
          <div className="text-xs text-ink-700">Suhashi & Darshana • 2 May 2026</div>
        </div>
        <Link
          href="/settings"
          className="rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-900"
        >
          Link
        </Link>
      </div>
    </div>
  );
}

export function BottomNav({ pathname }: { pathname: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-ink-200 bg-white/90 backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1 px-2 py-2">
        {nav.slice(0, 4).map((item) => (
          <NavItem key={item.href} item={item} active={pathname === item.href} />
        ))}
      </div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1 px-2 pb-2">
        {nav.slice(4).map((item) => (
          <NavItem key={item.href} item={item} active={pathname === item.href} />
        ))}
      </div>
    </div>
  );
}

function NavItem({
  item,
  active
}: {
  item: { href: string; label: string };
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-center rounded-xl px-2 py-3 text-xs font-semibold",
        active ? "bg-ink-950 text-white" : "bg-white text-ink-900 border border-ink-200"
      )}
    >
      {item.label}
    </Link>
  );
}


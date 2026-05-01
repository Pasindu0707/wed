import { cn } from "@/lib/cn";

export function Badge({
  tone = "neutral",
  children,
  className
}: {
  tone?: "neutral" | "ok" | "warn" | "urgent";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-ink-100 text-ink-800",
        tone === "ok" && "bg-emerald-100 text-emerald-800",
        tone === "warn" && "bg-amber-100 text-amber-800",
        tone === "urgent" && "bg-red-100 text-red-800",
        className
      )}
    >
      {children}
    </span>
  );
}


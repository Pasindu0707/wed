import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-gradient-to-r from-ink-100 via-sky-100 to-ink-100",
        className
      )}
    />
  );
}


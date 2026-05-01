import * as React from "react";
import { cn } from "@/lib/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  size?: "lg" | "md";
};

export function Button({ className, variant = "primary", size = "lg", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none",
        size === "lg" ? "h-12 px-4 text-base" : "h-10 px-3 text-sm",
        variant === "primary" && "bg-ink-950 text-white shadow-soft",
        variant === "ghost" && "bg-white text-ink-950 border border-ink-200",
        variant === "danger" && "bg-red-600 text-white shadow-soft",
        className
      )}
      {...props}
    />
  );
}


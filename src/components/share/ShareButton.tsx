"use client";

import { useMemo, useState } from "react";

export function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const fullUrl = useMemo(() => {
    if (typeof window === "undefined") return url;
    const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return new URL(url, base).toString();
  }, [url]);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          if (navigator.share) {
            await navigator.share({ title: "Wedding checklist", url: fullUrl });
            return;
          }
        } catch {
          // fall through to copy
        }

        try {
          await navigator.clipboard.writeText(fullUrl);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        } catch {
          // no-op
        }
      }}
      className="rounded-xl border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-900"
    >
      {copied ? "Copied" : "Share"}
    </button>
  );
}


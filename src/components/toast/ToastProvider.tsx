"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "ok" | "warn" | "error";
type Toast = { id: string; message: string; tone: ToastTone };

const ToastCtx = createContext<{ push: (message: string, tone?: ToastTone) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const api = useMemo(
    () => ({
      push(message: string, tone: ToastTone = "ok") {
        const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
        setToasts((t) => [...t, { id, message, tone }]);
        window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1400);
      }
    }),
    []
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-24 left-0 right-0 z-[60]">
        <div className="mx-auto max-w-md px-4">
          <div className="flex flex-col gap-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "pointer-events-none rounded-2xl border bg-white/95 px-4 py-3 text-sm font-semibold shadow-soft backdrop-blur",
                  t.tone === "ok" && "border-sage-200 text-sage-700",
                  t.tone === "warn" && "border-amber-200 text-amber-900",
                  t.tone === "error" && "border-red-200 text-red-800"
                )}
              >
                {t.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}


"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useProgressStore } from "@/lib/store/useProgressStore";
import { X } from "lucide-react";

export function ToastHost() {
  const toasts = useProgressStore((s) => s.toasts);
  const dismiss = useProgressStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-80 max-w-[90vw] flex-col gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const accent =
            t.type === "xp"
              ? "from-violet-500 to-fuchsia-500"
              : t.type === "levelup"
                ? "from-amber-400 to-orange-500"
                : t.type === "badge"
                  ? "from-cyan-400 to-blue-500"
                  : t.type === "streak"
                    ? "from-orange-500 to-rose-500"
                    : t.type === "error"
                      ? "from-rose-500 to-red-600"
                      : "from-slate-500 to-slate-600";
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="pointer-events-auto overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 shadow-[0_10px_40px_-10px_rgba(124,92,255,0.4)] backdrop-blur-xl"
            >
              <div className={`h-1 w-full bg-gradient-to-r ${accent}`} />
              <div className="flex items-start gap-3 p-4">
                <div className="text-3xl">{t.emoji ?? "✨"}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{t.title}</div>
                  {t.subtitle && (
                    <div className="text-sm text-[var(--muted)]">{t.subtitle}</div>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="rounded-md p-1 text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white"
                  aria-label="Fermer"
                >
                  <X className="size-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

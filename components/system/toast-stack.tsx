"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect } from "react";
import { useFx, type Toast } from "@/lib/system/fx";

const EASE_SYS = [0.2, 0.9, 0.2, 1] as const;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useFx((s) => s.dismiss);

  useEffect(() => {
    const id = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(id);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <m.div
      layout
      className="sys-window toast"
      data-variant={toast.variant === "default" ? undefined : toast.variant}
      aria-hidden={toast.announce ? undefined : true}
      // A toast is a small System window: a line that widens, then opens.
      initial={{ opacity: 0, scaleX: 0.3, scaleY: 0.02 }}
      animate={{ opacity: [0, 1, 1], scaleX: [0.3, 1, 1], scaleY: [0.02, 0.02, 1] }}
      exit={{
        opacity: 0,
        scaleY: 0.02,
        transition: { duration: 0.22, ease: EASE_OUT },
      }}
      transition={{
        duration: 0.42,
        times: [0, 0.45, 1],
        ease: [EASE_SYS, EASE_SYS],
        layout: { type: "spring", duration: 0.35, bounce: 0 },
      }}
    >
      {toast.label && <span className="toast-label">[ {toast.label} ]</span>}
      {toast.message}
    </m.div>
  );
}

/** One polite live region for every System message (SPEC §8.3). */
export function ToastStack() {
  const toasts = useFx((s) => s.toasts);

  return (
    <div className="toast-region" aria-live="polite" aria-relevant="additions">
      <AnimatePresence initial={false} mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

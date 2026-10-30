"use client";

import { m } from "motion/react";
import { memo, useEffect, useId } from "react";
import type { Gate } from "@/content/gates";
import { useSystem } from "@/lib/system/store";
import { ShadowSilhouette } from "./shadow-silhouette";

/** One slot per gate, filled in extraction order (SPEC §4.4). */
export const ShadowsWindow = memo(function ShadowsWindow({ gates }: { gates: Gate[] }) {
  const cleared = useSystem((s) => s.cleared);
  const flying = useSystem((s) => s.flying);
  const landed = useSystem((s) => s.landed);
  const titleId = useId();

  // If no layout animation runs (reduced motion, Motion still loading), land anyway.
  useEffect(() => {
    if (!flying) return;
    const id = window.setTimeout(landed, 1200);
    return () => window.clearTimeout(id);
  }, [flying, landed]);

  const full = cleared.length >= gates.length;

  return (
    <section
      className="sys-window sys-reveal sys-area-shadows shadows"
      data-variant={full ? "shadow" : undefined}
      style={{ "--delay": "300ms" } as React.CSSProperties}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className="sys-chip">
        Shadows
      </h2>
      <ol className="slots">
        {gates.map((_, i) => {
          const gate = gates.find((g) => g.slug === cleared[i]);
          if (!gate) {
            return (
              <li key={`empty-${i}`} className="slot">
                <ShadowSilhouette grade="Soldier" ghost className="slot-ghost" />
                <span className="slot-label">empty</span>
              </li>
            );
          }
          const inFlight = flying === gate.slug;
          return (
            <li key={gate.slug} className="slot" data-filled={!inFlight || undefined}>
              {/* Shares a layoutId with the figure in the ARISE scene, so it flies here. */}
              <m.div
                layoutId={`shadow-${gate.slug}`}
                className="slot-figure"
                style={{ zIndex: inFlight ? 60 : undefined }}
                transition={{ type: "spring", duration: 0.8, bounce: 0.18 }}
                onLayoutAnimationComplete={() => {
                  if (inFlight) landed();
                }}
              >
                <ShadowSilhouette grade={gate.shadowGrade} />
              </m.div>
              <span className="slot-label">
                {gate.shadowGrade} · {gate.name}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="shadows-hint">
        {full ? "The army is complete." : "Clear a gate to extract its shadow."}
      </p>
    </section>
  );
});

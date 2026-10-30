"use client";

import { useEffect, useState } from "react";
import type { Gate, ShadowGrade } from "@/content/gates";
import { sfx } from "@/lib/system/sound";
import { useSystem } from "@/lib/system/store";
import { ShadowSilhouette } from "./shadow-silhouette";

const WORD = "arise";
const BACK_ROW = 7;

/**
 * Hidden: typing "arise" anywhere summons the shadow army (SPEC §10).
 * The front row is every shadow the visitor has extracted; a row of
 * nameless soldiers always stands behind it.
 */
export function Army({ gates }: { gates: Gate[] }) {
  const cleared = useSystem((s) => s.cleared);
  const [summon, setSummon] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      if ((e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]")) return;
      typed = (typed + e.key.toLowerCase()).slice(-WORD.length);
      if (typed !== WORD) return;
      typed = "";
      const s = useSystem.getState();
      if (s.phase === "hud" && !s.gate) {
        sfx.arise();
        setLeaving(false);
        setSummon((n) => n + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!summon) return;
    const leave = window.setTimeout(() => setLeaving(true), 3000);
    const end = window.setTimeout(() => setSummon(0), 3500);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(end);
    };
  }, [summon]);

  if (!summon) return null;

  const front: ShadowGrade[] = cleared.length
    ? cleared.map((slug) => gates.find((g) => g.slug === slug)?.shadowGrade ?? "Soldier")
    : [];
  const unit = (grade: ShadowGrade, i: number, count: number, size: string, base: number) => (
    <div
      key={i}
      className="army-unit"
      style={
        {
          width: size,
          aspectRatio: "40 / 62",
          "--delay": `${base + Math.abs(i - (count - 1) / 2) * 110}ms`,
        } as React.CSSProperties
      }
    >
      <ShadowSilhouette grade={grade} />
    </div>
  );

  return (
    <div key={summon} className="army" data-leaving={leaving || undefined} aria-hidden="true">
      <div className="arise-word-wrap">
        <p className="arise-word">Arise</p>
      </div>
      <div className="army-rows">
        <div className="army-row" data-row="back">
          {Array.from({ length: BACK_ROW }, (_, i) =>
            unit("Soldier", i, BACK_ROW, "clamp(38px, 7vw, 74px)", 350),
          )}
        </div>
        <div className="army-row">
          {front.map((grade, i) => unit(grade, i, front.length, "clamp(70px, 13vw, 132px)", 150))}
        </div>
      </div>
    </div>
  );
}

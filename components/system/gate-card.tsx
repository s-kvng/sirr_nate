"use client";

import { memo, useRef } from "react";
import type { Gate } from "@/content/gates";
import { useSystem } from "@/lib/system/store";

/** A project as a gate (SPEC §4.5). The portal opens out of its ring. */
export const GateCard = memo(function GateCard({ gate, index }: { gate: Gate; index: number }) {
  const cleared = useSystem((s) => s.cleared.includes(gate.slug));
  const ringRef = useRef<HTMLSpanElement>(null);

  const enter = () => {
    const ring = ringRef.current?.getBoundingClientRect();
    const x = ring ? ring.left + ring.width / 2 : window.innerWidth / 2;
    const y = ring ? ring.top + ring.height / 2 : window.innerHeight / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    useSystem.getState().openGate({ slug: gate.slug, origin: { x, y }, radius });
  };

  return (
    <li>
      <button
        type="button"
        className="gate sys-reveal"
        data-gate={gate.slug}
        data-red={gate.red || undefined}
        data-cleared={cleared || undefined}
        style={{ "--delay": `${450 + index * 70}ms` } as React.CSSProperties}
        onClick={enter}
      >
        <span ref={ringRef} className="gate-ring" aria-hidden="true">
          <span className="gate-core" />
        </span>
        <span className="gate-text">
          <small>
            {gate.red && "Red gate · "}Rank {gate.rank}
          </small>
          <b>{gate.name}</b>
          <em>
            {cleared ? (
              "Cleared ✓"
            ) : (
              <>
                Enter <span aria-hidden="true">›</span>
              </>
            )}
          </em>
        </span>
      </button>
    </li>
  );
});

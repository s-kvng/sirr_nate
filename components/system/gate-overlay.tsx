"use client";

import { m, useIsPresent, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Gate } from "@/content/gates";
import { toast } from "@/lib/system/fx";
import { sfx } from "@/lib/system/sound";
import { useSystem, type GateVisit } from "@/lib/system/store";
import { useLater } from "@/lib/system/use-later";
import { useReducedMotion } from "@/lib/system/use-reduced-motion";
import { PortalCanvas } from "./portal-canvas";
import { ShadowSilhouette } from "./shadow-silhouette";

type Stage = "portal" | "window" | "arise";
export type GateExit = "leave" | "arise";

const BLUE = "73,198,255";
const RED = "255,59,78";
const PURPLE = "143,91,255";

const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

const SHAKE: Keyframe[] = [
  { transform: "translateX(0)" },
  { transform: "translateX(-8px)", offset: 0.2 },
  { transform: "translateX(7px)", offset: 0.4 },
  { transform: "translateX(-5px)", offset: 0.6 },
  { transform: "translateX(3px)", offset: 0.8 },
  { transform: "translateX(0)" },
];

const circle = (r: number, { x, y }: GateVisit["origin"]) =>
  `circle(${r}px at ${x}px ${y}px)`;

/**
 * The dungeon swallows the screen out of the gate's ring and, on LEAVE,
 * shrinks back into it. After ARISE it simply fades: the shadow is the
 * thing to watch then.
 */
function overlayVariants(visit: GateVisit, reduced: boolean): Variants {
  if (reduced) {
    return {
      initial: { opacity: 0 },
      open: { opacity: 1, transition: { duration: 0.25 } },
      exit: { opacity: 0, transition: { duration: 0.2 } },
    };
  }
  return {
    initial: { clipPath: circle(0, visit.origin) },
    open: {
      clipPath: circle(visit.radius, visit.origin),
      transition: { duration: 0.75, ease: EASE_IN_OUT },
    },
    exit: (kind: GateExit) =>
      kind === "arise"
        ? { opacity: 0, transition: { duration: 0.35, ease: EASE_OUT } }
        : {
            clipPath: circle(0, visit.origin),
            transition: { duration: 0.5, ease: EASE_IN_OUT },
          },
  };
}

function AriseScene({ gate, showFigure }: { gate: Gate; showFigure: boolean }) {
  return (
    <div className="arise" aria-hidden="true">
      <div className="arise-pool" />
      <div className="arise-ring" />
      <div className="arise-stage">
        {showFigure && (
          <m.div layoutId={`shadow-${gate.slug}`} className="arise-figure">
            <div className="arise-rise">
              <ShadowSilhouette grade={gate.shadowGrade} />
            </div>
          </m.div>
        )}
      </div>
      <div className="arise-word-wrap">
        <p className="arise-word">Arise</p>
      </div>
    </div>
  );
}

export function GateOverlay({ gate, visit }: { gate: Gate; visit: GateVisit }) {
  const reduced = useReducedMotion();
  const isPresent = useIsPresent();
  const later = useLater();
  const closeGate = useSystem((s) => s.closeGate);
  const [wasCleared] = useState(() => useSystem.getState().cleared.includes(gate.slug));
  const [stage, setStage] = useState<Stage>(wasCleared ? "window" : "portal");
  const [flash, setFlash] = useState(false);
  const [variants] = useState(() => overlayVariants(visit, reduced));
  const windowRef = useRef<HTMLDivElement>(null);
  const escPresses = useRef(0);

  const red = !!gate.red;
  const locked = red && !wasCleared;
  const portalMs = reduced ? 900 : 1200;

  // 1. The portal: warp in, then the dungeon's window opens.
  useEffect(() => {
    if (stage !== "portal") return;
    sfx.portal();
    const id = window.setTimeout(() => {
      setStage("window");
      setFlash(!reduced);
    }, portalMs);
    return () => window.clearTimeout(id);
  }, [stage, portalMs, reduced]);

  // A red gate seals behind the visitor.
  useEffect(() => {
    if (!locked) return;
    const id = window.setTimeout(() => {
      sfx.lock();
      toast({
        label: "WARNING",
        message: "This is a red gate. You cannot leave until it is cleared.",
        variant: "danger",
        duration: 3400,
      });
    }, 300);
    return () => window.clearTimeout(id);
  }, [locked]);

  useEffect(() => {
    if (stage === "window") {
      windowRef.current?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
    }
  }, [stage]);

  // Esc always gets out (SPEC §4.5). A red gate warns once, then gives way.
  useEffect(() => {
    if (!isPresent) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || stage === "arise") return;
      e.preventDefault();
      if (locked && escPresses.current === 0) {
        escPresses.current = 1;
        sfx.warn();
        toast({
          label: "WARNING",
          message: "There is no escape. Press Esc again to force the gate open.",
          variant: "danger",
          duration: 3200,
        });
        if (!reduced) windowRef.current?.animate(SHAKE, { duration: 400, easing: "ease-out" });
        return;
      }
      closeGate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, locked, reduced, isPresent, closeGate]);

  // 2. ARISE: the shadow rises, then flies home to its slot when the gate clears.
  const extract = () => {
    setStage("arise");
    sfx.arise();
    later(
      () => {
        useSystem.getState().clearGate(gate.slug);
        toast({
          label: "SHADOW EXTRACTED",
          message: (
            <>
              {gate.name} joined the army as <b>{gate.shadowGrade}</b>.
            </>
          ),
          variant: "shadow",
          duration: 3200,
        });
      },
      reduced ? 1300 : 1950,
    );
  };

  return (
    <m.div
      className="gate-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${red ? "Red gate" : "Gate"}: ${gate.name}`}
      data-red={red || undefined}
      data-stage={stage}
      variants={variants}
      initial="initial"
      animate="open"
      exit="exit"
    >
      <PortalCanvas
        mode={stage === "portal" ? "warp" : stage === "arise" ? "arise" : "idle"}
        rgb={stage === "arise" ? PURPLE : red ? RED : BLUE}
      />

      {stage === "portal" && (
        <div
          className="portal-text"
          role="status"
          style={{ "--portal-ms": `${portalMs}ms` } as React.CSSProperties}
        >
          <span>
            Entering {red && "red "}gate · Rank {gate.rank}
          </span>
          <span className="portal-progress" aria-hidden="true">
            <i />
          </span>
        </div>
      )}

      {stage === "window" && (
        <div
          ref={windowRef}
          className="sys-window gate-window sys-anim-open"
          data-variant={red ? "danger" : undefined}
        >
          <h2 className="sys-chip">
            {red ? "Red gate" : "Gate"} · Rank {gate.rank}
          </h2>
          <h3 className="gate-name">{gate.name}</h3>
          <p className="gate-stack">{gate.stack.join(" · ")}</p>
          <p className="gate-summary">{gate.summary}</p>
          <div className="gate-loot">
            <span>LOOT</span>
            {gate.loot.map((l) => {
              const external = /^https?:/.test(l.href);
              return (
                <a
                  key={l.label}
                  href={l.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                >
                  {l.label}
                  <span aria-hidden="true">↗</span>
                </a>
              );
            })}
          </div>
          {!wasCleared && (
            <p className="gate-reward">
              Extractable shadow: <b>{gate.shadowGrade}</b>
            </p>
          )}
          <div className="gate-actions">
            {wasCleared ? (
              <span className="gate-cleared">CLEARED ✓</span>
            ) : (
              <button type="button" className="sys-btn" data-tone="shadow" onClick={extract}>
                Extract shadow
              </button>
            )}
            {!locked && (
              <button type="button" className="sys-btn" data-tone="ghost" onClick={closeGate}>
                Leave
              </button>
            )}
          </div>
        </div>
      )}

      {stage === "arise" && <AriseScene gate={gate} showFigure={isPresent} />}

      {flash && <div className="portal-flash" onAnimationEnd={() => setFlash(false)} />}
    </m.div>
  );
}

"use client";

import { AnimatePresence, LazyMotion, MotionConfig } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { Gate } from "@/content/gates";
import type { Profile } from "@/content/profile";
import { toast } from "@/lib/system/fx";
import { setSoundEnabled, sfx } from "@/lib/system/sound";
import { useSystem, type Phase } from "@/lib/system/store";
import { Army } from "./army";
import { BannerLayer } from "./banner";
import { GateCard } from "./gate-card";
import { GateOverlay, type GateExit } from "./gate-overlay";
import { MistCanvas } from "./mist-canvas";
import { Notification } from "./notification";
import { QuestWindow } from "./quest-window";
import { ShadowsWindow } from "./shadows-window";
import { IntroControls, SystemBar } from "./skip-controls";
import { StatusWindow } from "./status-window";
import { ToastStack } from "./toast-stack";

const loadFeatures = () => import("@/lib/system/motion-features").then((mod) => mod.default);

const hudState: Record<Phase, string> = {
  boot: "pending",
  notification: "hidden",
  awakening: "open",
  hud: "open",
  rewind: "closing",
};

/**
 * The System (SPEC §3): notification → awakening → hud.
 *
 * The HUD is always in the server HTML, so it's indexable and nothing shifts
 * when it appears; CSS keeps it hidden until the phase says otherwise.
 */
export function SystemHero({ profile, gates }: { profile: Profile; gates: Gate[] }) {
  const phase = useSystem((s) => s.phase);
  const gate = useSystem((s) => s.gate);
  const flying = useSystem((s) => s.flying);
  const soundOn = useSystem((s) => s.soundOn);
  const lastGate = useRef<string | null>(null);

  // Read saved progress before the first paint. The inline script in the
  // layout has already shown returning visitors the HUD; this makes React agree.
  useLayoutEffect(() => {
    void useSystem.persist.rehydrate();
    if (useSystem.getState().resolveBoot() === "first") return;
    const id = window.setTimeout(() => {
      sfx.chime();
      toast({ label: "SYSTEM", message: "Welcome back, Hunter." });
    }, 900);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    setSoundEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    if (phase === "awakening") sfx.chime();
    if (phase !== "rewind") return;
    const id = window.setTimeout(() => useSystem.getState().rewindDone(), 450);
    return () => window.clearTimeout(id);
  }, [phase]);

  // Focus goes back to the gate card the visitor came from.
  useEffect(() => {
    if (gate) {
      lastGate.current = gate.slug;
      return;
    }
    const slug = lastGate.current;
    lastGate.current = null;
    if (slug) document.querySelector<HTMLElement>(`[data-gate="${slug}"]`)?.focus({ preventScroll: true });
  }, [gate]);

  const interactive = (phase === "awakening" || phase === "hud") && !gate;
  const exitKind: GateExit = flying ? "arise" : "leave";
  const openGate = gate && gates.find((g) => g.slug === gate.slug);

  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">
        <div className="sys-hero" data-phase={phase}>
          <div className="sys-backdrop" aria-hidden="true">
            <MistCanvas gateCount={gates.length} />
            <div className="sys-grain" />
          </div>

          <main className="sys-stage">
            <div className="sys-hud" data-state={hudState[phase]} inert={!interactive}>
              <SystemBar />
              <StatusWindow profile={profile} />
              <QuestWindow profile={profile} gateCount={gates.length} />
              <ShadowsWindow gates={gates} />
              <section className="sys-area-gates" aria-labelledby="sys-gates-title">
                <h2 id="sys-gates-title" className="sr-only">
                  Gates
                </h2>
                <ul className="gates-list">
                  {gates.map((g, i) => (
                    <GateCard key={g.slug} gate={g} index={i} />
                  ))}
                </ul>
              </section>
            </div>
          </main>

          {(phase === "boot" || phase === "notification") && <Notification />}
          <IntroControls />

          <AnimatePresence custom={exitKind}>
            {gate && openGate && <GateOverlay key={gate.slug} gate={openGate} visit={gate} />}
          </AnimatePresence>

          <BannerLayer />
          <ToastStack />
          <Army gates={gates} />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { mistSignal } from "@/lib/system/signals";
import { useSystem } from "@/lib/system/store";
import { makeSprite, useCanvasLoop, type Scene } from "@/lib/system/use-canvas-loop";
import { useReducedMotion } from "@/lib/system/use-reduced-motion";

const BLUE = 0;
const PURPLE = 1;
const BURST = 2;

interface Mote {
  x: number;
  y: number;
  /** Depth 0.35–1: nearer motes are bigger, brighter and faster. */
  z: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  tint: number;
  boost: number;
}

function createMist(ctx: CanvasRenderingContext2D): Scene {
  const sprites = [makeSprite("73,198,255"), makeSprite("143,91,255"), makeSprite("255,211,107")];
  let burstSprite = sprites[BURST];
  let motes: Mote[] = [];
  let w = 0;
  let h = 0;
  let t = 0;
  let energy = 0;

  const seed = (m: Partial<Mote>, anywhere: boolean): Mote => {
    const z = 0.35 + Math.random() * 0.65;
    return Object.assign(m, {
      x: Math.random(),
      y: anywhere ? Math.random() : 1.04 + Math.random() * 0.06,
      z,
      vy: 0.025 + Math.random() * 0.075,
      size: (8 + Math.random() * 16) * z,
      alpha: (0.45 + Math.random() * 0.55) * (0.45 + z * 0.55),
      phase: Math.random() * Math.PI * 2,
      tint: Math.random() < mistSignal.purple ? PURPLE : BLUE,
      boost: 1,
    }) as Mote;
  };

  return {
    resize(nw, nh) {
      w = nw;
      h = nh;
      const count = nw < 640 ? 54 : 80;
      if (motes.length !== count) {
        motes = Array.from({ length: count }, () => seed({}, true));
      }
    },
    frame(dt) {
      t += dt;
      energy += (mistSignal.energy - energy) * Math.min(1, dt * 2.5);

      if (mistSignal.burst) {
        burstSprite = makeSprite(mistSignal.burst);
        mistSignal.burst = null;
        // A wave of motes rushes up from below in the burst color.
        for (const m of motes) {
          if (Math.random() < 0.45) {
            m.tint = BURST;
            m.y = 1.02 + Math.random() * 0.5;
            m.boost = 4 + Math.random() * 4;
          }
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const speed = 1 + energy * 5;
      for (const m of motes) {
        m.y -= m.vy * m.z * speed * m.boost * dt;
        m.x += Math.sin(t * 0.35 + m.phase) * 0.005 * m.z * dt;
        if (m.y < -0.04) seed(m, false);
        const twinkle = 0.72 + 0.28 * Math.sin(t * 1.5 + m.phase * 3);
        ctx.globalAlpha = Math.min(1, m.alpha * twinkle * (1 + energy * 0.7));
        const s = m.size * (1 + energy * 0.35);
        const sprite = m.tint === BURST ? burstSprite : sprites[m.tint];
        ctx.drawImage(sprite, m.x * w - s / 2, m.y * h - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/** Ambient mana motes (SPEC §4.7). Turns purple as the shadow army grows. */
export function MistCanvas({ gateCount }: { gateCount: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const covered = useSystem((s) => s.gate !== null);
  const shadows = useSystem((s) => s.cleared.length);

  useEffect(() => {
    mistSignal.purple = (shadows / gateCount) * 0.7;
  }, [shadows, gateCount]);

  // Soft particles gain nothing from retina resolution; 1.5x keeps fill cost down.
  useCanvasLoop(ref, createMist, { running: !covered, still: reduced, dprCap: 1.5 });

  return <canvas ref={ref} className="sys-mist" aria-hidden="true" />;
}

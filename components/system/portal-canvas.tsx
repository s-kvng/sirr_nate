"use client";

import { useCallback, useEffect, useRef } from "react";
import { makeSprite, useCanvasLoop, type Scene } from "@/lib/system/use-canvas-loop";
import { useReducedMotion } from "@/lib/system/use-reduced-motion";

export type PortalMode = "warp" | "idle" | "arise";

interface Params {
  mode: PortalMode;
  /** "r,g,b" */
  rgb: string;
}

interface Particle {
  a: number;
  r: number;
  s: number;
  z: number;
  px: number;
  py: number;
  x: number;
  y: number;
  vy: number;
  size: number;
  alpha: number;
  spark: boolean;
}

/** The pool the shadow rises from, as a fraction of the height (matches .arise-pool). */
const POOL_Y = 0.87;
const SMOKE_TOP = 0.12;

function createPortal(ctx: CanvasRenderingContext2D, params: () => Params): Scene {
  let w = 0;
  let h = 0;
  let t = 0;
  let modeT = 0;
  let mode: PortalMode | null = null;
  let rgb = "";
  let glow: HTMLCanvasElement | null = null;
  let mote: HTMLCanvasElement | null = null;
  let color = "";
  const P: Particle[] = [];

  const swirl = (p: Partial<Particle>, fresh: boolean) =>
    Object.assign(p, {
      a: Math.random() * Math.PI * 2,
      r: fresh ? Math.random() : 0.85 + Math.random() * 0.15,
      s: 0.5 + Math.random(),
      z: 0.6 + Math.random() * 1.6,
      px: NaN,
      py: NaN,
    });

  // Shadow smoke wells up out of the pool in a column and thins as it climbs.
  // Fresh particles start below the surface, so the column builds instead of popping in.
  const smoke = (p: Partial<Particle>, fresh: boolean) => {
    const spark = Math.random() < 0.3;
    const spread = (Math.random() + Math.random() - 1) * (spark ? 0.3 : 0.22);
    return Object.assign(p, {
      x: 0.5 + spread,
      y: POOL_Y + (fresh ? Math.random() * 0.45 : Math.random() * 0.08),
      vy: spark ? 0.28 + Math.random() * 0.34 : 0.1 + Math.random() * 0.16,
      size: spark ? 2.5 + Math.random() * 3.5 : 50 + Math.random() * 90,
      alpha: spark ? 0.75 + Math.random() * 0.25 : 0.09 + Math.random() * 0.12,
      a: Math.random() * Math.PI * 2,
      spark,
    });
  };

  const sync = () => {
    const p = params();
    if (p.rgb !== rgb) {
      rgb = p.rgb;
      glow = makeSprite(rgb, 256);
      mote = makeSprite(rgb, 64);
      color = `rgb(${rgb})`;
    }
    if (p.mode !== mode) {
      const from = mode;
      mode = p.mode;
      modeT = 0;
      if (mode === "arise") P.forEach((q) => smoke(q, true));
      else if (from === "arise" || from === null) P.forEach((q) => swirl(q, true));
    }
  };

  return {
    resize(nw, nh) {
      w = nw;
      h = nh;
      const count = nw < 640 ? 170 : 260;
      while (P.length < count) P.push(swirl({}, true) as Particle);
      P.length = count;
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, w, h);
    },
    frame(dt) {
      sync();
      t += dt;
      modeT += dt;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.max(w, h) * 0.62;

      // Still frame (reduced motion): a static radial glow and nothing else.
      if (dt === 0) {
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#02040a";
        ctx.fillRect(0, 0, w, h);
        const g = R * (mode === "arise" ? 0.9 : 1.1);
        ctx.globalAlpha = 0.5;
        ctx.drawImage(glow!, cx - g / 2, (mode === "arise" ? h * 0.8 : cy) - g / 2, g, g);
        ctx.globalAlpha = 1;
        return;
      }

      // Trails: fade the previous frame instead of clearing it.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = mode === "arise" ? "rgba(6,2,14,0.2)" : "rgba(2,4,10,0.2)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      if (mode === "arise") {
        const g = R * 1.1;
        ctx.globalAlpha = 0.18 + 0.06 * Math.sin(t * 3);
        ctx.drawImage(glow!, cx - g / 2, h * POOL_Y - g / 2, g, g);
        for (const p of P) {
          p.y -= p.vy * dt;
          p.a += dt * (p.spark ? 3 : 1.2);
          // 0 at the pool's surface, 1 at the top of the column.
          const life = (POOL_Y - p.y) / (POOL_Y - SMOKE_TOP);
          if (life >= 1) {
            smoke(p, false);
            continue;
          }
          if (life <= 0) continue;
          const fade = Math.sin(Math.PI * life);
          const x = p.x * w + Math.sin(p.a) * (p.spark ? 6 : 18) * life;
          const y = p.y * h;
          if (p.spark) {
            // Embers: short vertical streaks.
            ctx.globalAlpha = p.alpha * fade;
            ctx.drawImage(mote!, x - p.size / 2, y - p.size * 2, p.size, p.size * 4);
          } else {
            const s = p.size * (0.55 + life * 0.9);
            ctx.globalAlpha = p.alpha * fade;
            ctx.drawImage(mote!, x - s / 2, y - s / 2, s, s * 1.3);
          }
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        return;
      }

      // Warp pulls everything in faster and faster; idle is a slow, dim swirl.
      const warp = mode === "warp";
      const k = warp ? Math.min(1, modeT / 1.2) : 0;
      const inward = warp ? 0.18 + 1.5 * k * k : 0.035;
      const spin = warp ? 0.9 + 2.6 * k : 0.35;
      const dim = warp ? 1 : 0.45;

      const g = R * (0.75 + k * 0.5);
      ctx.globalAlpha = (0.55 + 0.25 * Math.sin(t * 6)) * (0.55 + k * 0.8) * dim;
      ctx.drawImage(glow!, cx - g / 2, cy - g / 2, g, g);

      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      for (const p of P) {
        p.r -= inward * p.s * dt;
        p.a += spin * (1.6 - p.r) * p.s * dt;
        if (p.r < 0.02) {
          swirl(p, false);
          continue;
        }
        const x = cx + Math.cos(p.a) * p.r * R;
        const y = cy + Math.sin(p.a) * p.r * R * 0.62;
        if (p.px === p.px) {
          ctx.globalAlpha = (0.12 + 0.88 * (1 - p.r)) * dim;
          ctx.lineWidth = p.z * (warp ? 1 : 0.8);
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        p.px = x;
        p.py = y;
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    },
  };
}

/** Full-screen gate effect behind the overlay (SPEC §4.5). */
export function PortalCanvas({ mode, rgb }: Params) {
  const ref = useRef<HTMLCanvasElement>(null);
  const params = useRef<Params>({ mode, rgb });
  const reduced = useReducedMotion();

  useEffect(() => {
    params.current = { mode, rgb };
  }, [mode, rgb]);

  const create = useCallback(
    (ctx: CanvasRenderingContext2D) => createPortal(ctx, () => params.current),
    [],
  );

  useCanvasLoop(ref, create, { still: reduced, redraw: `${mode}${rgb}` });

  return <canvas ref={ref} aria-hidden="true" />;
}

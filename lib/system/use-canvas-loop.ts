import { useEffect, useRef, type RefObject } from "react";

export interface Scene {
  resize(width: number, height: number): void;
  /** Draws one frame. dt is in seconds; 0 means draw a still frame. */
  frame(dt: number): void;
}

interface Options {
  /** False pauses the loop and leaves the last frame on screen. */
  running?: boolean;
  /** Draws a single still frame instead of looping. */
  still?: boolean;
  dprCap?: number;
  /** When this changes while the loop is stopped, the still frame is redrawn. */
  redraw?: unknown;
}

/**
 * Runs a canvas scene on requestAnimationFrame. Pauses while the tab is
 * hidden or `running` is false, caps the device pixel ratio, and keeps the
 * backing store sized to the element.
 */
export function useCanvasLoop(
  ref: RefObject<HTMLCanvasElement | null>,
  createScene: (ctx: CanvasRenderingContext2D) => Scene,
  { running = true, still = false, dprCap = 2, redraw }: Options = {},
) {
  const control = useRef<{ sync: () => void; still: () => void } | null>(null);
  const flags = useRef({ running, still });

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const scene = createScene(ctx);
    let raf = 0;
    let last = 0;

    const active = () =>
      flags.current.running &&
      !flags.current.still &&
      document.visibilityState === "visible";

    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene.resize(w, h);
      if (!active()) scene.frame(0);
    };

    const tick = (now: number) => {
      // Clamp dt so a stalled frame never teleports the particles.
      const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
      last = now;
      scene.frame(dt);
      raf = requestAnimationFrame(tick);
    };

    const sync = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (active()) raf = requestAnimationFrame(tick);
    };

    fit();
    sync();
    control.current = {
      sync,
      still: () => {
        if (!active()) scene.frame(0);
      },
    };

    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      control.current = null;
    };
  }, [ref, createScene, dprCap]);

  useEffect(() => {
    flags.current = { running, still };
    control.current?.sync();
  }, [running, still]);

  useEffect(() => {
    control.current?.still();
  }, [redraw]);
}

/** A soft round mote, rendered once and stamped with drawImage. */
export function makeSprite(rgb: string, size = 64) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.12, `rgba(${rgb},0.9)`);
  grad.addColorStop(0.3, `rgba(${rgb},0.22)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

"use client";

import clsx from "clsx";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { toast } from "@/lib/system/fx";
import { sfx } from "@/lib/system/sound";
import { useSystem } from "@/lib/system/store";
import { useLater } from "@/lib/system/use-later";
import { useReducedMotion } from "@/lib/system/use-reduced-motion";

// Original wording (SPEC §4.1). Keep it.
const TEXT =
  "A visitor has been detected.\nYou have been granted access to the Player's profile.\n\nWill you accept?";
const CHARS = [...TEXT];
const CHAR_MS = 22;
const NEWLINE_MS = 180;

const SHAKE: Keyframe[] = [
  { transform: "translateX(0)" },
  { transform: "translateX(-8px)", offset: 0.2 },
  { transform: "translateX(7px)", offset: 0.4 },
  { transform: "translateX(-5px)", offset: 0.6 },
  { transform: "translateX(3px)", offset: 0.8 },
  { transform: "translateX(0)" },
];

/** The entry gate to the site: the System asks the visitor to accept. */
export function Notification() {
  const phase = useSystem((s) => s.phase);
  const introExit = useSystem((s) => s.introExit);
  const replays = useSystem((s) => s.replays);
  const reduced = useReducedMotion();
  const later = useLater();
  const titleId = useId();
  const textId = useId();
  const windowRef = useRef<HTMLDivElement>(null);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const exited = useRef(false);
  const [typed, setTyped] = useState(0);
  const [alert, setAlert] = useState(false);

  const shown = reduced ? TEXT.length : typed;
  const ready = shown >= TEXT.length;
  const closing = introExit !== null;

  // Type once the window has finished opening. On the first visit the open
  // animation starts from CSS before hydration, so ask the element where it is.
  useEffect(() => {
    if (phase !== "notification" || reduced) return;
    let timer = 0;
    let cancelled = false;
    let i = 0;
    const step = () => {
      i += 1;
      setTyped(i);
      if (i < TEXT.length) {
        timer = window.setTimeout(step, TEXT[i - 1] === "\n" ? NEWLINE_MS : CHAR_MS);
      }
    };
    const start = () => {
      if (!cancelled) timer = window.setTimeout(step, 120);
    };
    const opening = windowRef.current
      ?.getAnimations()
      .find((a) => (a as CSSAnimation).animationName === "sys-open");
    if (opening && opening.playState !== "finished") opening.finished.then(start, start);
    else start();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [phase, reduced]);

  useEffect(() => {
    if (phase !== "notification") return;
    const id = window.setTimeout(() => sfx.chime(), replays > 0 ? 150 : 500);
    return () => window.clearTimeout(id);
  }, [phase, replays]);

  useEffect(() => {
    if (ready && phase === "notification") acceptRef.current?.focus({ preventScroll: true });
  }, [ready, phase]);

  const finishExit = () => {
    if (exited.current) return;
    exited.current = true;
    const s = useSystem.getState();
    if (s.introExit === "skip") s.skipIntro();
    else s.accept();
  };

  // Safety net: if the close animation never reports back (hidden tab), move on anyway.
  const onExitTimeout = useEffectEvent(finishExit);
  useEffect(() => {
    if (!closing) return;
    const id = window.setTimeout(onExitTimeout, 600);
    return () => window.clearTimeout(id);
  }, [closing]);

  const accept = () => useSystem.getState().exitIntro("accept");

  const decline = () => {
    const n = useSystem.getState().decline();
    sfx.warn();
    if (n === 1) {
      toast({
        label: "WARNING",
        message: "Declining is not permitted.",
        variant: "danger",
        duration: 2600,
      });
      if (!reduced) windowRef.current?.animate(SHAKE, { duration: 400, easing: "ease-out" });
      setAlert(true);
      later(() => setAlert(false), 650);
    } else {
      toast({
        label: "SYSTEM",
        message: "The System has accepted on your behalf.",
        variant: "danger",
        duration: 2600,
      });
      later(() => useSystem.getState().exitIntro("accept"), 450);
    }
  };

  return (
    <div className="notif-layer">
      <div
        ref={windowRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        className={clsx("sys-window notif", closing ? "sys-anim-close" : "sys-anim-open")}
        data-alert={alert || undefined}
        style={{ "--delay": `${replays > 0 ? 150 : 500}ms` } as React.CSSProperties}
        onAnimationEnd={(e) => {
          if (closing && e.target === e.currentTarget) finishExit();
        }}
      >
        <h2 id={titleId} className="sys-chip notif-chip">
          <span className="notif-bang" aria-hidden="true">
            !
          </span>
          Notification
        </h2>
        <p id={textId} className="notif-text">
          <span className="sr-only">{TEXT}</span>
          {/* One span per character, so typing only flips classes and nothing
              in the paragraph ever moves (no layout shift). */}
          <span aria-hidden="true">
            {CHARS.map((ch, i) => (
              <span
                key={i}
                className={i < shown ? undefined : "notif-ghost"}
                data-caret={(!ready && i === shown - 1) || undefined}
              >
                {ch}
              </span>
            ))}
          </span>
        </p>
        <div className="notif-actions" data-ready={ready || undefined}>
          <button
            ref={acceptRef}
            type="button"
            className="sys-btn"
            onClick={accept}
            disabled={closing}
          >
            Accept
          </button>
          <button
            type="button"
            className="sys-btn"
            data-tone="ghost"
            onClick={decline}
            disabled={closing}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

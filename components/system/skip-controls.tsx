"use client";

import { memo } from "react";
import { setSoundEnabled, sfx } from "@/lib/system/sound";
import { useSystem } from "@/lib/system/store";

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M2.5 6h2.6L8.5 3v10L5.1 10H2.5z" fill="currentColor" stroke="none" />
      {on ? (
        <>
          <path d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8" strokeLinecap="round" />
          <path d="M12.4 3.8a6 6 0 0 1 0 8.4" strokeLinecap="round" />
        </>
      ) : (
        <path d="M10.8 6.2l3.4 3.6M14.2 6.2l-3.4 3.6" strokeLinecap="round" />
      )}
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5" strokeLinecap="round" />
      <path d="M3 2.6v2.6h2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Muted by default (SPEC §6). The accessible name stays "Sound"; aria-pressed carries the state. */
export function SoundToggle() {
  const on = useSystem((s) => s.soundOn);

  const toggle = () => {
    useSystem.getState().toggleSound();
    if (!on) {
      // Enable inside the click so the AudioContext may start.
      setSoundEnabled(true);
      sfx.chime();
    }
  };

  return (
    <button type="button" className="ctl" aria-pressed={on} onClick={toggle}>
      <SpeakerIcon on={on} />
      Sound
      <span className="ctl-state" aria-hidden="true">
        {on ? "On" : "Off"}
      </span>
    </button>
  );
}

/** Bottom-right during the notification and the count-up (SPEC §3.2). */
export function IntroControls() {
  const phase = useSystem((s) => s.phase);
  if (phase !== "boot" && phase !== "notification" && phase !== "awakening") return null;

  const skip = () => {
    const s = useSystem.getState();
    if (s.phase === "notification") s.exitIntro("skip");
    else s.skipIntro();
  };

  return (
    <div className="intro-controls">
      <SoundToggle />
      <button type="button" className="ctl" onClick={skip}>
        Skip intro <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}

/** Top row of the HUD: System status, the visitor's earned title, and controls. */
export const SystemBar = memo(function SystemBar() {
  const questComplete = useSystem((s) => s.questComplete);
  const replay = useSystem((s) => s.replayIntro);

  return (
    <div className="sys-bar">
      <p className="sys-bar-status">
        <span className="sys-dot" aria-hidden="true" />
        <span>System online</span>
        <span className="sys-sep" aria-hidden="true" />
        <span className="sys-bar-hunter">
          Hunter · <b data-earned={questComplete || undefined}>{questComplete ? "Talent Scout" : "Guest"}</b>
        </span>
      </p>
      <div className="sys-bar-actions">
        <SoundToggle />
        <button type="button" className="ctl" onClick={replay}>
          <ReplayIcon />
          Replay<span className="max-[419px]:hidden"> awakening</span>
        </button>
      </div>
    </div>
  );
});

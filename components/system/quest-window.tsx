"use client";

import { memo, useEffect, useId, useState } from "react";
import type { Profile } from "@/content/profile";
import { showBanner, toast } from "@/lib/system/fx";
import { mistSignal } from "@/lib/system/signals";
import { sfx } from "@/lib/system/sound";
import { useSystem } from "@/lib/system/store";
import { useCountdown } from "@/lib/system/use-countdown";
import { prefersReducedMotion } from "@/lib/system/use-reduced-motion";
import { Digits } from "./digits";

/** Scroll to an element, focus it, and briefly mark it as the quest's target. */
function target(el: HTMLElement | null, focus: HTMLElement | null = el) {
  if (!el) return;
  el.scrollIntoView({
    block: "center",
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  focus?.focus({ preventScroll: true });
  el.setAttribute("data-targeted", "");
  window.setTimeout(() => el.removeAttribute("data-targeted"), 1400);
}

function Goal({
  label,
  done,
  count,
  max,
  onGo,
  children,
}: {
  label: string;
  done: boolean;
  count: number;
  max: number;
  onGo?: () => void;
  children?: React.ReactNode;
}) {
  const body = (
    <>
      <span className="goal-mark" aria-hidden="true" />
      <span className="goal-label">{label}</span>
      {onGo && (
        <span className="goal-go" aria-hidden="true">
          ›
        </span>
      )}
    </>
  );

  return (
    <li className="goal" data-done={done || undefined}>
      {onGo ? (
        <button type="button" className="goal-link" onClick={onGo}>
          {body}
        </button>
      ) : (
        <span className="goal-link">{body}</span>
      )}
      {children}
      <b className="goal-count">
        {Math.min(count, max)}/{max}
        <span className="sr-only">{done ? ", complete" : ""}</span>
      </b>
    </li>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ label: "SYSTEM", message: "Address copied.", duration: 1800 });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked: the address is still selectable text.
    }
  };

  return (
    <button type="button" className="sys-btn" data-size="sm" data-tone="ghost" onClick={copy}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** The daily quest is the navigation (SPEC §4.3). */
export const QuestWindow = memo(function QuestWindow({ profile, gateCount }: { profile: Profile; gateCount: number }) {
  const cleared = useSystem((s) => s.cleared.length);
  const allocated = useSystem((s) => s.allocated);
  const contacted = useSystem((s) => s.contacted);
  const questComplete = useSystem((s) => s.questComplete);
  const countdown = useCountdown();
  const chipId = useId();
  const titleId = useId();

  const gatesDone = cleared >= gateCount;
  const pointsDone = allocated >= profile.points;
  const allDone = gatesDone && pointsDone && contacted;

  useEffect(() => {
    if (!allDone || questComplete) return;
    // Let the last action land (a shadow flying home, a toast) before the payoff.
    const id = window.setTimeout(() => {
      useSystem.getState().completeQuest();
      showBanner("gold", "Quest complete");
      sfx.complete();
      mistSignal.burst = "255,211,107";
      toast({
        label: "REWARD",
        message: (
          <>
            Title acquired: <b>“Talent Scout”</b>. The Player replies within 24h.
          </>
        ),
        variant: "gold",
        duration: 5000,
      });
    }, 1000);
    return () => window.clearTimeout(id);
  }, [allDone, questComplete]);

  const goGates = () => {
    const next =
      document.querySelector<HTMLElement>(".gate:not([data-cleared])") ??
      document.querySelector<HTMLElement>(".gate");
    target(next);
  };

  const goPoints = () => {
    const stats = document.getElementById("sys-stats");
    target(stats, stats?.querySelector<HTMLElement>('.stat-plus:not([aria-disabled="true"])') ?? null);
  };

  const send = () => {
    useSystem.getState().contact();
    sfx.blip();
    toast({
      label: "MESSAGE",
      message: (
        <>
          Channel open: <b>{profile.email}</b>
        </>
      ),
      duration: 5000,
    });
  };

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent("Hire a Developer")}`;

  return (
    <section
      className="sys-window sys-reveal sys-area-quest quest"
      data-variant={questComplete ? "gold" : undefined}
      style={{ "--delay": "150ms" } as React.CSSProperties}
      aria-labelledby={`${chipId} ${titleId}`}
    >
      <h2 id={chipId} className="sys-chip">
        Daily quest
      </h2>
      <p id={titleId} className="quest-title">
        Hire a Developer
      </p>

      <ul className="goals">
        <Goal
          label="Clear gates (view projects)"
          done={gatesDone}
          count={cleared}
          max={gateCount}
          onGo={goGates}
        />
        <Goal
          label="Allocate ability points"
          done={pointsDone}
          count={allocated}
          max={profile.points}
          onGo={goPoints}
        />
        <Goal label="Send the Player a message" done={contacted} count={contacted ? 1 : 0} max={1}>
          <button
            type="button"
            className="sys-btn"
            data-size="sm"
            onClick={send}
            disabled={contacted}
          >
            {contacted ? "Sent" : "Send"}
          </button>
        </Goal>
      </ul>

      {contacted && (
        <div className="channel">
          <span className="channel-label">CHANNEL OPEN</span>
          <div className="channel-row">
            <a className="channel-email" href={mailto}>
              {profile.email}
            </a>
            <CopyButton text={profile.email} />
            {profile.socials.length > 0 && (
              <span className="channel-links">
                {profile.socials.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                    {s.label} <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </span>
            )}
          </div>
        </div>
      )}

      {questComplete ? (
        <p className="quest-warn" data-complete="">
          Quest complete. Reward: “Talent Scout”. The Player replies within 24h.
        </p>
      ) : (
        <p className="quest-warn">
          WARNING: Leaving this quest incomplete may result in missing a great hire.
        </p>
      )}

      <p className="quest-timer">
        {questComplete ? "NEXT QUEST IN" : "TIME REMAINING"}
        <b>
          <Digits value={countdown} />
        </b>
      </p>
    </section>
  );
});

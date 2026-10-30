"use client";

import { memo, useEffect, useEffectEvent, useRef, useState } from "react";
import type { Profile } from "@/content/profile";
import { showBanner, toast } from "@/lib/system/fx";
import { RANK_COLORS, rankOf } from "@/lib/system/rank";
import { mistSignal } from "@/lib/system/signals";
import { sfx } from "@/lib/system/sound";
import { useSystem } from "@/lib/system/store";
import { useReducedMotion } from "@/lib/system/use-reduced-motion";
import { Digits } from "./digits";

const PULSE: Keyframe[] = [
  { transform: "scale(1.5)", filter: "brightness(2)" },
  { transform: "none", filter: "none" },
];

/** LEVEL · identity · RANK, with the awakening count-up (SPEC §3.1). */
function StatusTop({ profile }: { profile: Profile }) {
  const phase = useSystem((s) => s.phase);
  const reduced = useReducedMotion();
  const badgeRef = useRef<HTMLElement>(null);
  const [count, setCount] = useState(1);
  const [floats, setFloats] = useState<number[]>([]);
  const [aura, setAura] = useState(0);
  const [prevPhase, setPrevPhase] = useState(phase);
  const target = profile.level;

  // Restart from level 1 every time the awakening begins (including replays).
  if (phase !== prevPhase) {
    setPrevPhase(phase);
    if (phase === "awakening") {
      setCount(1);
      setFloats([]);
    }
  }

  const level = phase === "awakening" && !reduced ? count : target;
  const rank = rankOf(level);

  const finish = useEffectEvent(() => {
    mistSignal.energy = 0;
    mistSignal.burst = "255,211,107";
    useSystem.getState().finishAwakening();
    showBanner("gold", "Level up");
    sfx.levelUp();
    toast({
      label: "RANK",
      message: (
        <>
          Player rank reassessed: <b>{rankOf(target)}</b>
        </>
      ),
    });
    window.setTimeout(
      () =>
        toast({
          label: "DAILY QUEST",
          message: "“Hire a Developer” has arrived.",
          duration: 3400,
        }),
      1000,
    );
  });

  useEffect(() => {
    if (phase !== "awakening") return;
    let id = 0;
    if (reduced) {
      id = window.setTimeout(finish, 650);
      return () => window.clearTimeout(id);
    }

    let lv = 1;
    const up = () => {
      lv += 1;
      setCount(lv);
      sfx.tick(lv);
      if (rankOf(lv) !== rankOf(lv - 1)) {
        badgeRef.current?.animate(PULSE, {
          duration: 450,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        });
        if (lv >= 26) setAura((a) => a + 1);
      }
      if (lv % 3 === 0) setFloats((f) => [...f.slice(-2), lv]);
      // The step interval eases from 40 ms to ~120 ms, so it slows into the finish.
      if (lv < target) id = window.setTimeout(up, 40 + (lv / target) * 80);
      else id = window.setTimeout(finish, 160);
    };
    // Mana surges while the Player levels.
    mistSignal.energy = 0.7;
    id = window.setTimeout(up, 650);
    return () => {
      window.clearTimeout(id);
      mistSignal.energy = 0;
    };
  }, [phase, reduced, target]);

  return (
    <div className="status-top">
      <div className="lv">
        <span className="lv-label">Level</span>
        <span className="lv-num">
          <Digits value={level} />
        </span>
        {floats.map((n) => (
          <span
            key={n}
            className="lv-float"
            aria-hidden="true"
            onAnimationEnd={() => setFloats((f) => f.filter((x) => x !== n))}
          >
            Level up!
          </span>
        ))}
      </div>

      <dl className="ident">
        <dt>Name</dt>
        <dd>
          <h1>{profile.name}</h1>
        </dd>
        <dt>Job</dt>
        <dd>{profile.job}</dd>
        <dt>Title</dt>
        <dd>{profile.title}</dd>
      </dl>

      <div className="rank" style={{ "--rank": RANK_COLORS[rank] } as React.CSSProperties}>
        <span className="rank-label">Rank</span>
        <b ref={badgeRef} className="rank-badge">
          {rank}
          {aura > 0 && <span key={aura} className="rank-aura" aria-hidden="true" />}
        </b>
      </div>
    </div>
  );
}

function StatRow({
  stat,
  value,
  spent,
}: {
  stat: Profile["stats"][number];
  value: number;
  spent: boolean;
}) {
  const [floats, setFloats] = useState<number[]>([]);
  const [bump, setBump] = useState(0);
  const clicks = useRef(0);

  const add = () => {
    const sys = useSystem.getState();
    if (!sys.allocate(stat.key)) return;
    const n = ++clicks.current;
    sfx.blip();
    setBump(n);
    setFloats((f) => [...f, n]);
    toast({
      message: (
        <>
          <b>{stat.key}</b> increased by 1.
        </>
      ),
      duration: 1500,
      announce: false,
    });
    if (useSystem.getState().points === 0) {
      toast({
        label: "QUEST",
        message: "Goal complete: ability points allocated.",
        duration: 2600,
      });
    }
  };

  return (
    <div className="stat">
      <span className="stat-key">
        {stat.key}
        <small>{stat.label}</small>
      </span>
      <b key={bump} className="stat-val" data-bump={bump > 0 || undefined}>
        {value}
      </b>
      <button
        type="button"
        className="stat-plus"
        aria-label={`Add a point to ${stat.key} (${stat.label})`}
        aria-disabled={spent}
        onClick={add}
      >
        +
      </button>
      {floats.map((n) => (
        <span
          key={n}
          className="plus-float"
          aria-hidden="true"
          onAnimationEnd={() => setFloats((f) => f.filter((x) => x !== n))}
        >
          +1
        </span>
      ))}
    </div>
  );
}

function Stats({ profile }: { profile: Profile }) {
  const stats = useSystem((s) => s.stats);
  const points = useSystem((s) => s.points);
  const spent = points === 0;

  return (
    <div className="stats" id="sys-stats">
      {profile.stats.map((stat) => (
        <StatRow key={stat.key} stat={stat} value={stats[stat.key]} spent={spent} />
      ))}
      <div className="stat" data-kind="points" data-spent={spent || undefined}>
        <span className="stat-key">
          Points<small>{spent ? "all spent" : "spend them"}</small>
        </span>
        <b className="stat-val">{points}</b>
      </div>
    </div>
  );
}

/** The profile (SPEC §4.2). */
export const StatusWindow = memo(function StatusWindow({ profile }: { profile: Profile }) {
  return (
    <section
      className="sys-window sys-reveal sys-area-status status"
      style={{ "--delay": "0ms" } as React.CSSProperties}
      aria-label="Status"
    >
      <div className="sys-chip" aria-hidden="true">
        Status
      </div>

      <StatusTop profile={profile} />

      <div className="bars">
        <div className="bar" data-kind="hp">
          <span>HP</span>
          <span className="bar-track" aria-hidden="true">
            <span className="bar-fill" style={{ "--pct": profile.hp.pct } as React.CSSProperties} />
          </span>
          <span className="bar-val">{profile.hp.label}</span>
        </div>
        <div className="bar" data-kind="mp">
          <span>MP</span>
          <span className="bar-track" aria-hidden="true">
            <span className="bar-fill" style={{ "--pct": profile.mp.pct } as React.CSSProperties} />
          </span>
          <span className="bar-val">{profile.mp.label}</span>
        </div>
      </div>

      <Stats profile={profile} />

      <ul className="skills" aria-label="Skills">
        {profile.skills.map((skill) => (
          <li key={skill.name}>
            {skill.kind} · <b>{skill.name}</b> {skill.level}
          </li>
        ))}
      </ul>

      <div className="syslog">
        <h2 className="syslog-title">System log</h2>
        <ol>
          {profile.log.map((entry) => (
            <li key={entry.text}>
              <span className="syslog-text">{entry.text}</span>
              <span className="syslog-when">{entry.when}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
});

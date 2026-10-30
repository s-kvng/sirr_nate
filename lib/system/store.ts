import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { gates } from "@/content/gates";
import { profile, type StatKey } from "@/content/profile";
import { STORAGE_KEY } from "./keys";

/**
 * boot         server render and first client render, before the persisted state is read
 * notification the System asks the visitor to accept
 * awakening    HUD windows open and the level counts up
 * hud          interactive
 * rewind       HUD windows close before the intro replays
 */
export type Phase = "boot" | "notification" | "awakening" | "hud" | "rewind";

export interface GateVisit {
  slug: string;
  /** Viewport point the portal opens from: the centre of the card's ring. */
  origin: { x: number; y: number };
  /** Distance from the origin to the farthest viewport corner. */
  radius: number;
}

interface Progress {
  points: number;
  stats: Record<StatKey, number>;
  allocated: number;
  /** Gate slugs in extraction order. Fills the shadow slots. */
  cleared: string[];
  contacted: boolean;
  questComplete: boolean;
  introSeen: boolean;
  soundOn: boolean;
}

interface SystemState extends Progress {
  phase: Phase;
  declines: number;
  /** Set while the notification plays its close animation; says what happens after. */
  introExit: "accept" | "skip" | null;
  /** Times the intro was replayed this session. The first run waits for the page to settle. */
  replays: number;
  gate: GateVisit | null;
  /** The shadow currently flying from the gate overlay into its slot. */
  flying: string | null;

  resolveBoot: () => "first" | "returning";
  decline: () => number;
  exitIntro: (kind: "accept" | "skip") => void;
  accept: () => void;
  finishAwakening: () => void;
  skipIntro: () => void;
  replayIntro: () => void;
  rewindDone: () => void;
  allocate: (key: StatKey) => boolean;
  openGate: (visit: GateVisit) => void;
  closeGate: () => void;
  clearGate: (slug: string) => void;
  landed: () => void;
  contact: () => void;
  completeQuest: () => void;
  toggleSound: () => void;
}

const initialStats = Object.fromEntries(
  profile.stats.map((s) => [s.key, s.value]),
) as Record<StatKey, number>;

const initialProgress: Progress = {
  points: profile.points,
  stats: initialStats,
  allocated: 0,
  cleared: [],
  contacted: false,
  questComplete: false,
  introSeen: false,
  soundOn: false,
};

export const useSystem = create<SystemState>()(
  persist(
    (set, get) => ({
      ...initialProgress,
      phase: "boot",
      declines: 0,
      introExit: null,
      replays: 0,
      gate: null,
      flying: null,

      resolveBoot: () => {
        const returning = get().introSeen;
        set({ phase: returning ? "hud" : "notification" });
        return returning ? "returning" : "first";
      },
      decline: () => {
        const declines = get().declines + 1;
        set({ declines });
        return declines;
      },
      exitIntro: (kind) => set({ introExit: kind }),
      accept: () => set({ phase: "awakening", introExit: null }),
      finishAwakening: () => set({ phase: "hud", introSeen: true }),
      skipIntro: () => set({ phase: "hud", introSeen: true, introExit: null }),
      replayIntro: () =>
        set((s) => ({ phase: "rewind", gate: null, replays: s.replays + 1 })),
      rewindDone: () => set({ phase: "notification", declines: 0 }),
      allocate: (key) => {
        const { points, stats, allocated } = get();
        if (points <= 0) return false;
        set({
          points: points - 1,
          allocated: allocated + 1,
          stats: { ...stats, [key]: stats[key] + 1 },
        });
        return true;
      },
      openGate: (visit) => set({ gate: visit }),
      closeGate: () => set({ gate: null }),
      clearGate: (slug) => {
        const { cleared } = get();
        set({
          gate: null,
          flying: slug,
          cleared: cleared.includes(slug) ? cleared : [...cleared, slug],
        });
      },
      landed: () => set({ flying: null }),
      contact: () => set({ contacted: true }),
      completeQuest: () => set({ questComplete: true }),
      toggleSound: () => set({ soundOn: !get().soundOn }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // The server render uses the defaults; SystemHero rehydrates in a layout
      // effect so the first client render matches the HTML.
      skipHydration: true,
      partialize: (s): Progress => ({
        points: s.points,
        stats: s.stats,
        allocated: s.allocated,
        cleared: s.cleared,
        contacted: s.contacted,
        questComplete: s.questComplete,
        introSeen: s.introSeen,
        soundOn: s.soundOn,
      }),
      // Content can change between visits: drop gates that no longer exist
      // and fill in stats that were added since.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<Progress>;
        const slugs = new Set(gates.map((g) => g.slug));
        return {
          ...current,
          ...p,
          stats: { ...current.stats, ...p.stats },
          cleared: (p.cleared ?? []).filter((s) => slugs.has(s)),
        };
      },
    },
  ),
);

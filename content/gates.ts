// Placeholder projects from the prototype. Replace with real values before launch (SPEC §11).

export type Rank = "E" | "D" | "C" | "B" | "A" | "S";
export type ShadowGrade = "Soldier" | "Knight" | "Commander";

export interface Gate {
  slug: string;
  name: string;
  rank: Rank;
  /** Exactly one gate is red: the flagship project. */
  red?: boolean;
  stack: string[];
  /** One or two sentences. */
  summary: string;
  loot: { label: string; href: string }[];
  shadowGrade: ShadowGrade;
}

export const gates: Gate[] = [
  {
    slug: "habit-tracker",
    name: "Habit Tracker",
    rank: "C",
    stack: ["Expo", "React Native"],
    summary:
      "A daily habit app with streaks, reminders and a home-screen widget. Cleared solo in six weeks.",
    loot: [
      { label: "Case study", href: "#" },
      { label: "TestFlight", href: "#" },
      { label: "Source", href: "#" },
    ],
    shadowGrade: "Soldier",
  },
  {
    slug: "realtime-chat",
    name: "Realtime Chat",
    rank: "A",
    stack: ["Next.js", "Convex"],
    summary:
      "Live rooms with presence, typing indicators and reactions that sync in under 100 ms.",
    loot: [
      { label: "Case study", href: "#" },
      { label: "Live demo", href: "#" },
      { label: "Source", href: "#" },
    ],
    shadowGrade: "Knight",
  },
  {
    slug: "this-portfolio",
    name: "This Portfolio",
    rank: "S",
    red: true,
    stack: ["Next.js", "Canvas"],
    summary:
      "The dungeon you are standing in. Built to be explored, not scrolled.",
    loot: [
      { label: "Behind the build", href: "#" },
      { label: "Source", href: "#" },
    ],
    shadowGrade: "Commander",
  },
];

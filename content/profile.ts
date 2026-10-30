// Placeholder content from the prototype. Replace with real values before launch (SPEC §11).

export type StatKey = "STR" | "AGI" | "PER" | "VIT" | "INT";

export interface Profile {
  name: string;
  job: string;
  title: string;
  level: number;
  hp: { label: string; pct: number };
  mp: { label: string; pct: number };
  stats: { key: StatKey; label: string; value: number }[];
  points: number;
  skills: { kind: "Passive" | "Active"; name: string; level: string }[];
  log: { text: string; when: string }[];
  email: string;
  socials: { label: string; href: string }[];
}

export const profile: Profile = {
  name: "Nathaniel Adama",
  job: "Full-Stack Developer",
  title: "The One Who Ships on Fridays",
  level: 27,
  hp: { label: "9,999 / 9,999", pct: 100 },
  mp: { label: "Focus 640 / 800", pct: 80 },
  stats: [
    { key: "STR", label: "Backend", value: 78 },
    { key: "AGI", label: "Frontend", value: 92 },
    { key: "PER", label: "Design", value: 74 },
    { key: "VIT", label: "Uptime", value: 88 },
    { key: "INT", label: "Architecture", value: 85 },
  ],
  points: 5,
  skills: [
    { kind: "Passive", name: "Type Safety", level: "Lv.MAX" },
    { kind: "Active", name: "Ship", level: "Cooldown 0s" },
    { kind: "Active", name: "Realtime Sync", level: "Lv.8" },
  ],
  log: [
    { text: "Shipped Realtime Chat v2", when: "3d ago" },
    { text: "Cleared a 40-file TypeScript migration", when: "1w ago" },
    { text: "Habit Tracker passed 1,000 streaks", when: "2w ago" },
  ],
  email: "hello@yourdomain.dev",
  socials: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
  ],
};

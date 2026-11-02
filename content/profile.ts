// Real content. HP/MP labels are intentional jokes; stat values are self-ratings.

export type StatKey = "STR" | "AGI" | "PER" | "VIT" | "INT" | "WIS";

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
  job: "Co-founder · Full-Stack Engineer",
  title: "The One Who Ships on Fridays",
  level: 70,
  hp: { label: "9,999 / 9,999", pct: 100 },
  mp: { label: "Focus 640 / 800", pct: 80 },
  stats: [
    { key: "STR", label: "Backend", value: 78 },
    { key: "AGI", label: "Frontend", value: 92 },
    { key: "PER", label: "Design", value: 74 },
    { key: "VIT", label: "Uptime", value: 88 },
    { key: "INT", label: "AI", value: 82 },
    { key: "WIS", label: "Architecture", value: 85 },
  ],
  points: 5,
  skills: [
    { kind: "Passive", name: "Type Safety", level: "Lv.MAX" },
    { kind: "Active", name: "Ship", level: "Cooldown 0s" },
    { kind: "Active", name: "Cross-Platform", level: "iOS · Android · Web" },
  ],
  log: [
    { text: "Shipped the Xolace profile redesign (PR #666)", when: "Oct 2026" },
    { text: "3,719 GitHub contributions in a year", when: "2026" },
    { text: "Added live tallies and SMS recovery to COMPSSA Elect", when: "Aug 2026" },
  ],
  email: "nathan@xolaceinc.com",
  socials: [
    { label: "GitHub", href: "https://github.com/s-kvng" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/nathaniel-e-adama-93802a234/" },
    { label: "X", href: "https://x.com/sirr_nathan" },
  ],
};

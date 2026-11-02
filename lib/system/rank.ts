import type { Rank } from "@/content/gates";

/** Levels run 1–100: E 1–19, D 20–39, C 40–59, B 60–79, A 80–99, S 100. */
export function rankOf(level: number): Rank {
  if (level >= 100) return "S";
  if (level >= 80) return "A";
  if (level >= 60) return "B";
  if (level >= 40) return "C";
  if (level >= 20) return "D";
  return "E";
}

export const RANK_COLORS: Record<Rank, string> = {
  E: "#9aa6b2",
  D: "#5fe39a",
  C: "#49c6ff",
  B: "#a98bff",
  A: "#ffd36b",
  S: "#ff4d6a",
};

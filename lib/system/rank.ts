import type { Rank } from "@/content/gates";

/** E 1–5, D 6–10, C 11–15, B 16–20, A 21–25, S 26+ */
export function rankOf(level: number): Rank {
  if (level >= 26) return "S";
  if (level >= 21) return "A";
  if (level >= 16) return "B";
  if (level >= 11) return "C";
  if (level >= 6) return "D";
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

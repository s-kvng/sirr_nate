// The three projects on the HUD. The layout (grid, quest goal, shadow slots) is built for three.

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
    slug: "ktu-src-app",
    name: "KTU SRC App",
    rank: "B",
    stack: ["Expo", "Supabase"],
    summary:
      "The official mobile app for the Koforidua Technical University SRC. Co-built with one other developer, from the contribution guide up.",
    loot: [{ label: "Source", href: "https://github.com/KTU-SRC-Org/ktu_src_app" }],
    shadowGrade: "Soldier",
  },
  {
    slug: "compssa-elect",
    name: "KTU COMPSSA Elect",
    rank: "A",
    stack: ["Next.js", "Convex"],
    summary:
      "The election platform for KTU's computer science students' association. Live tallies and presence for the electoral commission, with logins and recovery sent by SMS.",
    loot: [
      { label: "Live site", href: "https://ktucompssa-elect.vercel.app" },
      { label: "Source", href: "https://github.com/s-kvng/COMPSSA_ELECT" },
    ],
    shadowGrade: "Knight",
  },
  {
    slug: "xolace",
    name: "Xolace",
    rank: "S",
    red: true,
    stack: ["Expo", "Convex", "Clerk"],
    summary:
      "The startup I co-founded: an anonymous app for putting unnamed feelings into words. Live on iOS and Android, rated 4.9.",
    loot: [
      { label: "Website", href: "https://xolace.app" },
      { label: "App Store", href: "https://apps.apple.com/gh/app/xolace/id6761601429" },
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.xolaceincorg.xolace",
      },
    ],
    shadowGrade: "Commander",
  },
];

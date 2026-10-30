import { useId } from "react";
import type { ShadowGrade } from "@/content/gates";

/**
 * Original, generic shadow figures (SPEC §2.1: nothing traced from the series).
 * Filled with currentColor; the blade and eyes glow on their own.
 */
const bodies: Record<ShadowGrade, React.ReactNode> = {
  // Hooded, tattered cloak, spear.
  Soldier: (
    <>
      <path d="M11.8 29.6L9.2 51.5l2.6-1.9 1.5 6 2.6-3.9 2 7.3 2.1-5 2.1 5 2-7.3 2.6 3.9 1.5-6 2.6 1.9-2.6-21.9z" />
      <path d="M20 2.6c2.7.7 4.8 3 5.1 6.1l.5 3.8c-1.7 1-3.6 1.5-5.6 1.5s-3.9-.5-5.6-1.5l.5-3.8c.3-3.1 2.4-5.4 5.1-6.1z" />
      <path d="M13.2 13.4c4.4-1.4 9.2-1.4 13.6 0l2.6 2.2-1.3 15.4c-5.4 1.6-10.8 1.6-16.2 0L10.6 15.6z" />
      <path d="M10.7 14.8L7.6 18.4l-1 11.8 1.9.6 1.9-9.6z" />
      <path d="M29.3 14.8l3 3.5.5 9.6-1.8.5-.9-6.5z" />
      <path d="M32.6 1l1.4 4.3-.8 1.2V58h-1.2V6.5l-.8-1.2z" />
    </>
  ),
  // Great helm, angular pauldrons, cape, sword planted point-down.
  Knight: (
    <>
      <path d="M11 14L5 58l4-3 3 4.5 4-3.5 4 4 4-4 4 3.5 3-4.5 4 3-6-44z" opacity=".85" />
      <path d="M20 2.6l1.4.8c2.6.6 4 2.9 4.1 5.8l-.1 3.4L20 14l-5.4-1.4-.1-3.4c.1-2.9 1.5-5.2 4.1-5.8z" />
      <path d="M14.2 12.8l-5.8 1-1.8 3.8L9 19.2l4.6-2.4zM25.8 12.8l5.8 1 1.8 3.8-2.4 1.6-4.6-2.4z" />
      <path d="M13.4 14h13.2l1 16-7.6 2-7.6-2z" />
      <path d="M9 18.6l3.6-1.6 6 9.4-1.6 1.8zM31 18.6L27.4 17l-6 9.4 1.6 1.8z" />
      <path d="M12.6 29.6L11.4 44l1.8 15h4.2l1.4-26 1.2-1 1.2 1 1.4 26h4.2l1.8-15-1.2-14.4z" />
    </>
  ),
  // Crowned helm, spiked pauldrons, wide cape, greatsword.
  Commander: (
    <>
      <path d="M10 13L2 59l4.5-3 3 4.5 4.5-3.5 4 4 4-4 4 4 4-4 4.5 3.5 3-4.5L38 59 30 13z" opacity=".85" />
      <path d="M15 10l-.6-5.6 2.2 2.2 1.6-4.4L20 5l1.8-2.8 1.6 4.4 2.2-2.2L25 10l.4 2.8-5.4 1.6-5.4-1.6z" />
      <path d="M14.4 12.6l-6.8.2-4-2.4 1.4 4.4.6 3.6 3.6 1.4 4.8-3.2zM25.6 12.6l6.8.2 4-2.4-1.4 4.4-.6 3.6-3.6 1.4-4.8-3.2z" />
      <path d="M13.2 14h13.6l1.2 17-8 2-8-2z" />
      <path d="M8.4 18.8l4.2-1.8 5.8 8.6-1.6 2zM31.6 18.8L27.4 17l-5.8 8.6 1.6 2z" />
      <path d="M12.2 30.6L10.8 45l1.8 14.6h4.6l1.6-26.4 1.2-1 1.2 1 1.6 26.4h4.6L29.2 45l-1.4-14.4z" />
    </>
  ),
};

const blades: Partial<Record<ShadowGrade, React.ReactNode>> = {
  Knight: (
    <g stroke="#b9a2ff" strokeLinecap="round" opacity=".9">
      <path d="M20 28.6V58" strokeWidth="1.2" />
      <path d="M16.6 27.6h6.8" strokeWidth="1.3" />
      <circle cx="20" cy="25.6" r="1" fill="#b9a2ff" stroke="none" />
    </g>
  ),
  Commander: (
    <g fill="#c9b6ff" opacity=".95">
      <path d="M19 28.8h2l-.4 29.8-.6 1.6-.6-1.6z" />
      <path d="M15 27.2h10v1.4H15z" />
      <circle cx="20" cy="24.8" r="1.3" />
    </g>
  ),
};

const eyes: Record<ShadowGrade, string> = {
  Soldier: "M17.3 8.6l2 .8M22.7 8.6l-2 .8",
  Knight: "M16.8 8.4l2.2.9M23.2 8.4l-2.2.9",
  Commander: "M16.5 9l2.5.9M23.5 9l-2.5.9",
};

interface Props {
  grade: ShadowGrade;
  className?: string;
  /** An unlit outline: no eyes, no blade. Used for empty slots. */
  ghost?: boolean;
}

export function ShadowSilhouette({ grade, className, ghost }: Props) {
  const id = useId();
  const fade = `${id}-fade`;
  const glow = `${id}-glow`;

  return (
    <svg
      viewBox="0 0 40 62"
      className={className}
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      <defs>
        {/* The feet dissolve into the dark they rose from. */}
        <linearGradient id={`${fade}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset=".72" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={fade} maskUnits="userSpaceOnUse" x="-4" y="-4" width="48" height="70">
          <rect x="-4" y="-4" width="48" height="70" fill={`url(#${fade}-g)`} />
        </mask>
        {!ghost && (
          <filter id={glow} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>
      <g mask={`url(#${fade})`} fill="currentColor">
        {bodies[grade]}
        {!ghost && blades[grade]}
      </g>
      {!ghost && (
        <g className="sil-eyes" filter={`url(#${glow})`}>
          <path
            d={eyes[grade]}
            stroke="#ece2ff"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}
    </svg>
  );
}

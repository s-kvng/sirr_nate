/**
 * Values the canvas loops read every frame. Kept outside React so that
 * changing them never re-renders anything: write from effects or handlers,
 * read from the rAF loop.
 */
export const mistSignal = {
  /** 0–0.7: share of new motes that spawn purple (SPEC §4.4). */
  purple: 0,
  /** 0–1: how hard the mana is surging. The loop eases toward it. */
  energy: 0,
  /** Set to a color triple and the next frame turns a wave of motes into a burst of it. */
  burst: null as string | null,
  /** False while a full-screen overlay hides the mist. */
  visible: true,
};

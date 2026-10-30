import { useSyncExternalStore } from "react";

const PLACEHOLDER = "--:--:--";

function subscribe(onChange: () => void) {
  let id = 0;
  const tick = () => {
    onChange();
    // Re-align to the next whole second so the display never skips one.
    id = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
  };
  id = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
  return () => window.clearTimeout(id);
}

/** Time left until the visitor's local midnight, as HH:MM:SS. */
function snapshot() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const s = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function useCountdown() {
  return useSyncExternalStore(subscribe, snapshot, () => PLACEHOLDER);
}

import { useCallback, useEffect, useRef } from "react";

/** setTimeout that is cleared when the component unmounts. */
export function useLater() {
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);

  return useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
}

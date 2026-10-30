/**
 * Rajdhani has no tabular figures, so tabular-nums does nothing. Counters
 * that tick (the level, the countdown) set each digit in a fixed cell instead,
 * or the text beside them would jitter on every change.
 */
export function Digits({ value }: { value: string | number }) {
  const text = String(value);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {[...text].map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="dg">
              {ch}
            </span>
          ) : (
            ch
          ),
        )}
      </span>
    </>
  );
}

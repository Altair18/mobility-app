import { useEffect, useRef, useState } from 'react';

/** A number that counts to each new value over a moment instead of jumping. */
export function useCountTo(target: number, ms = 450): number {
  const [shown, setShown] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    const from = current.current;
    if (from === target) return;
    const start = Date.now();
    let frame = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / ms);
      const eased = 1 - (1 - t) ** 3;
      current.current = Math.round(from + (target - from) * eased);
      setShown(current.current);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);

  return shown;
}

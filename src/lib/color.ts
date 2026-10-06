function rgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

/** `a` blended towards `b`: weight 1 is all `a`, 0 is all `b`. */
export function mix(a: string, b: string, weight: number): string {
  const x = rgb(a);
  const y = rgb(b);
  if (!x || !y) return a;
  return `#${x.map((c, i) => Math.round(c * weight + y[i] * (1 - weight)).toString(16).padStart(2, '0')).join('')}`;
}

/** A hex colour at some opacity. */
export function alpha(hex: string, opacity: number): string {
  const x = rgb(hex);
  return x ? `rgba(${x[0]},${x[1]},${x[2]},${opacity})` : hex;
}

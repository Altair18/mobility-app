import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';

/**
 * Two-tone icons on a 24 × 24 grid. Every shape is stroked; `fill` shapes also get a soft tint (or a
 * solid fill when the icon is active), and `inner` details sit inside a filled shape, so they turn cream
 * when it fills in.
 */
type Shape = ({ p: string } | { c: [number, number, number] } | { r: [number, number, number, number, number] }) & {
  fill?: boolean;
  inner?: boolean;
};

const FLAME = 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z';
/** Range-of-motion meter: a half circle, filled up to an angle. */
const ARC = 'M4.5 18 A7.5 7.5 0 0 1 19.5 18';

const SHAPES = {
  back: [{ p: 'M15 6l-6 6 6 6' }],
  chevron: [{ p: 'M9 6l6 6-6 6' }],
  close: [{ p: 'M6 6l12 12M18 6L6 18' }],
  check: [{ p: 'M5 12.5l4.5 4.5L19 7.5' }],
  plus: [{ p: 'M12 5v14M5 12h14' }],
  minus: [{ p: 'M5 12h14' }],
  pause: [{ p: 'M9 6v12M15 6v12' }],
  share: [{ p: 'M12 15V3M7 8l5-5 5 5' }, { p: 'M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6' }],
  download: [{ p: 'M12 4v11M7 10l5 5 5-5' }, { p: 'M5 20h14' }],
  infinity: [
    { p: 'M18.2 8.5c-2.9 0-4.6 3.5-6.2 3.5S8.7 8.5 5.8 8.5C3.9 8.5 2.5 10 2.5 12s1.4 3.5 3.3 3.5c2.9 0 4.6-3.5 6.2-3.5s3.3 3.5 6.2 3.5c1.9 0 3.3-1.5 3.3-3.5s-1.4-3.5-3.3-3.5z' },
  ],

  lock: [{ p: 'M8 10.5V8a4 4 0 0 1 8 0v2.5' }, { r: [5, 10.5, 14, 10, 3], fill: true }, { c: [12, 15.5, 0.6], inner: true }],
  target: [{ c: [12, 12, 8], fill: true }, { c: [12, 12, 3], inner: true }],
  mail: [{ r: [3, 5, 18, 14, 3], fill: true }, { p: 'M4 7l8 6 8-6', inner: true }],
  clock: [{ c: [12, 12, 8.5], fill: true }, { p: 'M12 7.5V12l3 2', inner: true }],
  sun: [{ c: [12, 12, 4], fill: true }, { p: 'M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4' }],
  sunrise: [{ p: 'M3 18h18' }, { p: 'M6.5 18a5.5 5.5 0 0 1 11 0z', fill: true }, { p: 'M12 4v3M4.9 9.9l2.1 2.1M19.1 9.9l-2.1 2.1' }],
  moon: [{ p: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z', fill: true }],
  person: [{ c: [12, 5, 2.5], fill: true }, { p: 'M6 10l6 1.5 6-1.5M12 11.5v4M9 21l3-5.5 3 5.5' }],
  layers: [{ p: 'M12 3l9 5-9 5-9-5 9-5z', fill: true }, { p: 'M3 13l9 5 9-5' }],
  prev: [{ p: 'M18 6l-8 6 8 6V6z', fill: true }, { p: 'M6 6v12' }],
  next: [{ p: 'M6 6l8 6-8 6V6z', fill: true }, { p: 'M18 6v12' }],
  user: [{ c: [12, 8, 4], fill: true }, { p: 'M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6', fill: true }],
  flame: [{ p: FLAME, fill: true }],

  // Tab bar
  home: [{ p: 'M4 11.2L12 4.5l8 6.7v7.3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z', fill: true }, { p: 'M10 20.5v-4a2 2 0 0 1 4 0v4', inner: true }],
  /** Today: the sun coming up over the horizon. */
  today: [{ p: 'M3 19h18' }, { p: 'M6 19a6 6 0 0 1 12 0z', fill: true }, { p: 'M12 4.5v3M5.2 8.7l2.1 2.1M18.8 8.7l-2.1 2.1' }],
  calendar: [{ r: [4, 5, 16, 15.5, 3.5], fill: true }, { p: 'M9 3.5v3M15 3.5v3' }, { p: 'M4 10h16', inner: true }],
  /** Plan: a calendar with a path running through the week. */
  plan: [
    { r: [4, 5, 16, 15.5, 3.5], fill: true },
    { p: 'M9 3.5v3M15 3.5v3' },
    { p: 'M7.5 17c2-4.5 5-0.5 8.5-5', inner: true },
    { c: [16, 12, 0.6], inner: true },
  ],
  bars: [{ r: [4.5, 12, 4, 8.5, 2], fill: true }, { r: [10, 4.5, 4, 16, 2], fill: true }, { r: [15.5, 9, 4, 11.5, 2], fill: true }],
  /** Progress: range of motion opening up. */
  arc: [{ p: 'M3 18h18' }, { p: ARC }, { p: 'M12 18H4.5A7.5 7.5 0 0 1 17.3 12.7z', fill: true }],
  sliders: [{ p: 'M4 8h8.1M17.9 8H20M4 16h2.1M11.9 16H20' }, { c: [15, 8, 2.9], fill: true }, { c: [9, 16, 2.9], fill: true }],

  /** Streak: steady growth rather than intensity. */
  sprout: [
    { p: 'M12 20.5V11' },
    { p: 'M12 13.5C12 9.5 9 7 4.5 7c0 4 3 6.5 7.5 6.5z', fill: true },
    { p: 'M12 11c0-4 2.5-7 7.5-7 0 4.5-3 7-7.5 7z', fill: true },
    { p: 'M8 20.5h8' },
  ],
  /** Streak stages either side of the sprout: just started, and well established. */
  seed: [{ p: 'M7 20.5h10' }, { p: 'M12 19c-2.2 0-3.5-1.2-3.5-2.8S10 13 12 13s3.5 1.6 3.5 3.2-1.3 2.8-3.5 2.8z', fill: true }, { p: 'M12 13c0-1.6.8-3 2.5-3.5' }],
  plant: [
    { p: 'M12 20.5V6.5' },
    { p: 'M12 16.5c0-3-2.4-5-6-5 0 3 2.4 5 6 5z', fill: true },
    { p: 'M12 14.5c0-3 2.4-5 6-5 0 3-2.4 5-6 5z', fill: true },
    { p: 'M12 10.5c0-2.6-2-4.4-5-4.4 0 2.6 2 4.4 5 4.4z', fill: true },
    { p: 'M12 8.5c0-2.6 2-4.5 5-4.5 0 2.6-2 4.5-5 4.5z', fill: true },
    { p: 'M8 20.5h8' },
  ],
  /** Gentle sessions. */
  feather: [{ p: 'M19 5c-6 0-12 5-12 12v2h2c7 0 10-7 10-14z', fill: true }, { p: 'M5 21l9.5-11.5' }],
  mat: [{ r: [3, 12.5, 14, 5, 1.5], fill: true }, { c: [17.5, 15, 3.5], fill: true }, { c: [17.5, 15, 0.9], inner: true }],
  wall: [{ r: [3, 4, 9, 16, 1.5], fill: true }, { p: 'M3 9.5h9M3 15h9M7.5 4v5.5M5.5 9.5V15M9.5 9.5V15M7.5 15v5', inner: true }, { p: 'M12 20h9' }],
  /** How a session felt: the meter a third, two thirds or all the way open. */
  level1: [{ p: ARC }, { p: 'M12 18H4.5A7.5 7.5 0 0 1 8.25 11.5z', fill: true }],
  level2: [{ p: ARC }, { p: 'M12 18H4.5A7.5 7.5 0 0 1 15.75 11.5z', fill: true }],
  level3: [{ p: `${ARC}z`, fill: true }],
} satisfies Record<string, Shape[]>;

const SOLID = {
  play: 'M8 5l11 7-11 7z',
} satisfies Record<string, string>;

export type IconName = keyof typeof SHAPES | keyof typeof SOLID;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  /** Fill the icon in, for the selected tab or option. */
  active?: boolean;
  /** Colour of the soft fill when not active (defaults to the icon colour). */
  tint?: string;
};

export function Icon({ name, size = 22, color = colors.ink, strokeWidth = 2, active, tint }: Props) {
  const solid = (SOLID as Record<string, string | undefined>)[name];
  if (solid) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d={solid} fill={color} />
      </Svg>
    );
  }
  const shapes: Shape[] = (SHAPES as Record<string, Shape[] | undefined>)[name] ?? [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {shapes.map((s, i) => {
        const look = s.fill
          ? { fill: active ? color : (tint ?? color), fillOpacity: active ? 1 : 0.18 }
          : s.inner && active
            ? { stroke: colors.cream }
            : {};
        if ('p' in s) return <Path key={i} d={s.p} {...look} />;
        if ('c' in s) return <Circle key={i} cx={s.c[0]} cy={s.c[1]} r={s.c[2]} {...look} />;
        return <Rect key={i} x={s.r[0]} y={s.r[1]} width={s.r[2]} height={s.r[3]} rx={s.r[4]} {...look} />;
      })}
    </Svg>
  );
}

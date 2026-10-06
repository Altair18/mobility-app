import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/constants/theme';
import type { AreaId } from '@/data/types';

/**
 * One glyph per area on a 24 × 24 grid. `soft` is the surrounding body for context, drawn faintly;
 * `strong` is the area itself. Joints get a dot plus a small arc for the way they move. Dots are [x, y, r].
 */
type Glyph = { soft?: string; strong?: string; fill?: string; dots?: [number, number, number][]; softDots?: [number, number, number][]; spine?: boolean[] };

const GLYPHS: Record<AreaId, Glyph> = {
  neck: { soft: 'M4 21 C4 17.5 7.5 16 12 16 C16.5 16 20 17.5 20 21', strong: 'M10.2 10.5 L10.2 15.5 M13.8 10.5 L13.8 15.5', softDots: [[12, 6.2, 3.6]] },
  shoulders: {
    soft: 'M8 14.5 L8.6 21 M16 14.5 L15.4 21',
    strong: 'M4.5 16 C4.8 12.6 7.8 11.4 12 11.4 C16.2 11.4 19.2 12.6 19.5 16',
    dots: [[5.6, 13.2, 2.3], [18.4, 13.2, 2.3]],
    softDots: [[12, 5.6, 3]],
  },
  elbows: { soft: 'M5 4 L10.5 13 L19 9.5', strong: 'M6.5 17.5 C8.5 20 12.5 20.5 15 18.5', dots: [[10.5, 13, 2.3]] },
  wrists: {
    soft: 'M3 20 L11.5 12.5 M13 11 L14.6 4.6 M13 11 L17.6 6 M13 11 L19.4 8.8',
    strong: 'M14.6 17.2 C17.6 16.8 20 14.6 20.6 11.8',
    dots: [[12.2, 11.8, 2.3]],
  },
  upperBack: { spine: [true, true, true, false, false] },
  lowerBack: { spine: [false, false, true, true, true] },
  hips: { soft: 'M8.2 14 L7 21.5 M15.8 14 L17 21.5', strong: 'M4.5 6.5 C5 12 8 14 12 14 C16 14 19 12 19.5 6.5', dots: [[8.2, 14, 2.3], [15.8, 14, 2.3]] },
  knees: { soft: 'M9.5 3 L12.5 11.5 L9.5 21', strong: 'M16.5 8.5 C18.5 10.5 18.5 13 16.5 15', dots: [[12.5, 11.5, 2.3]] },
  ankles: { soft: 'M9 3 L9 14.5 M9 17.5 L19.5 18.5', strong: 'M4.5 13.5 C4 16 5 18.5 6.5 19.5', dots: [[9, 16, 2.3]] },
  feet: {
    // A footprint: sole shaped through ball, arch and heel, with toes getting smaller towards the outside.
    fill: 'M12.4 21.6 C10.1 21.6 9.2 19.8 9.5 17.6 C9.8 15.5 8.6 14.1 8.5 11.9 C8.4 9.6 10 8.2 12.2 8.2 C14.7 8.2 16 10 15.8 12.4 C15.6 14.8 14.7 16.2 15 18.2 C15.3 20.3 14.6 21.6 12.4 21.6 Z',
    dots: [[9.6, 5.3, 1.75], [12.4, 4.3, 1.3], [14.7, 4.8, 1.15], [16.6, 6, 1.05], [17.9, 7.7, 0.95]],
  },
};

const FAINT = 0.32;

/** The glyph on its own, for placing inside your own frame. */
export function AreaGlyph({ area, size, color = colors.green }: { area: AreaId; size: number; color?: string }) {
  const g = GLYPHS[area];
  const stroke = { stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {g.soft ? <Path d={g.soft} {...stroke} strokeOpacity={FAINT} /> : null}
      {g.softDots?.map(([cx, cy, r]) => <Circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} fill={color} fillOpacity={FAINT} />)}
      {g.spine
        ? g.spine.map((on, i) => <Rect key={i} x={8.5} y={2.2 + i * 4.1} width={7} height={2.9} rx={1.45} fill={color} fillOpacity={on ? 1 : FAINT} />)
        : null}
      {g.fill ? <Path d={g.fill} fill={color} /> : null}
      {g.strong ? <Path d={g.strong} {...stroke} /> : null}
      {g.dots?.map(([cx, cy, r]) => <Circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} fill={color} />)}
    </Svg>
  );
}

/** Small round icon for one area. */
export function AreaIcon({ area, size = 36, color = colors.green }: { area: AreaId; size?: number; color?: string }) {
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, borderColor: color }]}>
      <AreaGlyph area={area} size={Math.round(size * 0.62)} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { borderWidth: 1.5, borderColor: colors.green, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(47,122,86,0.06)' },
});

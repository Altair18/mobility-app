import { useId } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';
import { AREA_NAMES, AREA_ORDER, SPOTS, VISIBLE } from '@/data/areas';
import { DETAIL, OUTLINE } from '@/data/figure';
import type { AreaId, BodyView } from '@/data/types';
import { tap } from '@/lib/haptics';

/** Skin tones (light → shade across the body), edge and hint-line colours for each figure fill. */
type Palette = { skin: [string, string, string]; edge: string; line: string; lineOpacity: number; shadow: string; shadowOpacity: number };
const PALETTES: Record<string, Palette> = {
  [colors.figure]: { skin: ['#EDE3CF', '#E2D5BC', '#D1C0A0'], edge: 'rgba(150,126,88,0.6)', line: '#8E7B5C', lineOpacity: 0.28, shadow: '#6B5636', shadowOpacity: 0.16 },
  '#3B6351': { skin: ['#4E7B65', '#3B6351', '#2B4B3B'], edge: 'rgba(255,255,255,0.2)', line: '#FFFFFF', lineOpacity: 0.16, shadow: '#0E2419', shadowOpacity: 0.3 },
  [colors.cream]: { skin: [colors.cream, colors.cream, '#F3E8D3'], edge: 'rgba(255,255,255,0.3)', line: '#8E7B5C', lineOpacity: 0, shadow: '#6B5636', shadowOpacity: 0 },
};

/** Soft shadows where the body folds: under the chin, the armpits and the groin. */
const SHADOWS: [number, number, number, number][] = [
  [110, 84, 26, 14],
  [66, 132, 18, 20],
  [154, 132, 18, 20],
  [110, 238, 22, 16],
];

/** Glow size [rx, ry] in figure units around each of an area's spots. Paired areas (hips, knees…) glow at both. */
const GLOW: Record<AreaId, [number, number]> = {
  neck: [20, 16],
  shoulders: [26, 24],
  elbows: [17, 22],
  wrists: [15, 17],
  upperBack: [46, 34],
  lowerBack: [42, 28],
  hips: [32, 28],
  knees: [22, 27],
  ankles: [16, 16],
  feet: [22, 13],
};

type FigureProps = {
  /** Height in points. The figure is half as wide. */
  height: number;
  /** Strength (0–1) per lit area. */
  glows?: Partial<Record<AreaId, number>>;
  /** Only light areas visible from this side. Leave out to light them all on the front figure. */
  view?: BodyView;
  fill?: string;
  /** Colour of lit areas. */
  glowColor?: string;
  /** Mark every area that can be tapped with a faint ring (body map). */
  segmented?: boolean;
  /** A check badge on each fully lit area (body map). */
  badges?: boolean;
  /** Draw only the lit areas, to layer over a plain figure (animated highlights). */
  overlay?: boolean;
};

export function BodyFigure({ height, glows = {}, view, fill = colors.figure, glowColor = colors.green, segmented, badges, overlay }: FigureProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const skinId = `skin${uid}`;
  const shadowId = `shadow${uid}`;
  const glowId = `glow${uid}`;
  const lightId = `light${uid}`;
  const clipId = `clip${uid}`;
  const palette = PALETTES[fill] ?? PALETTES[colors.figure];
  const side: BodyView = view ?? 'front';
  const lit = AREA_ORDER.filter((a) => (glows[a] ?? 0) > 0 && (!view || VISIBLE[view].includes(a)));
  // Without a view, back-only areas (upper and lower back) glow at their back spot on the front figure.
  const centres = (a: AreaId) => {
    const own = SPOTS[side].filter(([s]) => s === a);
    return own.length ? own : SPOTS.back.filter(([s]) => s === a);
  };

  return (
    <Svg width={height / 2} height={height} viewBox="0 0 220 440">
      <Defs>
        <LinearGradient id={skinId} x1={0} y1={0} x2={220} y2={0} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={palette.skin[0]} />
          <Stop offset="0.55" stopColor={palette.skin[1]} />
          <Stop offset="1" stopColor={palette.skin[2]} />
        </LinearGradient>
        <RadialGradient id={shadowId} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={palette.shadow} stopOpacity={palette.shadowOpacity} />
          <Stop offset="1" stopColor={palette.shadow} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={glowColor} stopOpacity={0.95} />
          <Stop offset="0.45" stopColor={glowColor} stopOpacity={0.6} />
          <Stop offset="1" stopColor={glowColor} stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id={lightId} x1={0} y1={0} x2={0} y2={440} gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.3} />
          <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
        <ClipPath id={clipId}>
          <Path d={OUTLINE} />
        </ClipPath>
      </Defs>

      {overlay ? null : <Path d={OUTLINE} fill={`url(#${skinId})`} />}
      {/* Soft light from above, so the figure has the same volume as the move character. */}
      {palette.shadowOpacity > 0 && !overlay ? <Path d={OUTLINE} fill={`url(#${lightId})`} /> : null}
      {palette.shadowOpacity > 0 && !overlay ? (
        <G clipPath={`url(#${clipId})`}>
          {SHADOWS.map(([cx, cy, rx, ry]) => (
            <Ellipse key={`${cx}${cy}`} cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${shadowId})`} />
          ))}
        </G>
      ) : null}

      {lit.length > 0 ? (
        <G clipPath={`url(#${clipId})`}>
          {lit.map((a) => (
            <G key={a} opacity={glows[a]}>
              {centres(a).map(([, x, y]) => (
                <Ellipse key={`${x}${y}`} cx={x} cy={y} rx={GLOW[a][0]} ry={GLOW[a][1]} fill={`url(#${glowId})`} />
              ))}
            </G>
          ))}
        </G>
      ) : null}

      {palette.lineOpacity > 0 && !overlay
        ? DETAIL[side].map((d) => <Path key={d} d={d} fill="none" stroke={palette.line} strokeOpacity={palette.lineOpacity} strokeWidth={1.5} strokeLinecap="round" />)
        : null}
      {overlay ? null : <Path d={OUTLINE} fill="none" stroke={palette.edge} strokeWidth={1} />}

      {segmented
        ? SPOTS[side]
            .filter(([a]) => !lit.includes(a))
            .map(([a, x, y]) => (
              <Circle key={`${a}${x}${y}`} cx={x} cy={y} r={10} fill="rgba(255,253,249,0.6)" stroke="rgba(70,52,24,0.38)" strokeWidth={1.2} strokeDasharray="3 2.5" />
            ))
        : null}

      {badges
        ? SPOTS[side]
            .filter(([a]) => (glows[a] ?? 0) >= 1)
            .map(([a, x, y]) => (
              <G key={`${a}${x}`}>
                <Circle cx={x} cy={y} r={8.5} fill="#FFFDF9" />
                <Path d={`M${x - 3.8} ${y} L${x - 1.1} ${y + 2.8} L${x + 4} ${y - 3.2}`} fill="none" stroke={glowColor} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
              </G>
            ))
        : null}
    </Svg>
  );
}

type MapProps = {
  view: BodyView;
  selected: AreaId[];
  onToggle: (area: AreaId) => void;
  height?: number;
};

/** Tappable body map: every area is outlined, selected ones fill in. Paired areas (both knees…) share one selection. */
export function BodyMap({ view, selected, onToggle, height = 396 }: MapProps) {
  const scale = height / 440;
  const glows = Object.fromEntries(selected.map((a) => [a, 1])) as Partial<Record<AreaId, number>>;
  return (
    <View style={{ width: height / 2, height }}>
      <BodyFigure height={height} glows={glows} view={view} segmented badges />
      {SPOTS[view].map(([area, x, y], i) => (
        <Pressable
          key={`${view}${i}`}
          accessibilityRole="button"
          accessibilityLabel={AREA_NAMES[area]}
          accessibilityState={{ selected: selected.includes(area) }}
          onPress={() => {
            tap();
            onToggle(area);
          }}
          style={[styles.spot, { left: x * scale - 24, top: y * scale - 24 }]}
        />
      ))}
    </View>
  );
}

export function ViewToggle({ view, onChange }: { view: BodyView; onChange: (v: BodyView) => void }) {
  return (
    <View style={styles.toggle}>
      {(['front', 'back'] as const).map((v) => {
        const on = view === v;
        return (
          <Pressable
            key={v}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            onPress={() => {
              tap();
              onChange(v);
            }}
            style={[styles.toggleItem, on && styles.toggleOn]}
          >
            <Text style={[styles.toggleLabel, on && { color: colors.ink }]}>{v === 'front' ? 'Front' : 'Back'}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  spot: { position: 'absolute', width: 48, height: 48 },
  toggle: {
    alignSelf: 'center',
    width: 220,
    padding: 4,
    borderRadius: 22,
    backgroundColor: 'rgba(90,70,40,0.08)',
    flexDirection: 'row',
    gap: 4,
  },
  toggleItem: { flex: 1, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  toggleOn: { backgroundColor: '#FFFDF9', boxShadow: '0px 2px 8px -2px rgba(70,50,20,0.25)' },
  toggleLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.muted },
});

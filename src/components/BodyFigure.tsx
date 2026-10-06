import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors, fonts } from '@/constants/theme';
import { AREA_CROP, AREA_NAMES, AREA_ORDER, SPOTS, VISIBLE } from '@/data/areas';
import { ZONES } from '@/data/figure';
import type { AreaId, BodyView } from '@/data/types';
import { tap } from '@/lib/haptics';

// The rendered figure. Both views share the 220 × 440 grid the zones are drawn on.
const BODY_IMAGE: Record<BodyView, ImageSourcePropType> = {
  front: require('../../assets/images/body-front.png'),
  back: require('../../assets/images/body-back.png'),
};

type FigureProps = {
  /** Height in points. The figure is half as wide (or square when cropped). */
  height: number;
  /** Strength (0–1) per lit area. */
  glows?: Partial<Record<AreaId, number>>;
  /** Only light areas visible from this side. Leave out to light them all on the front figure. */
  view?: BodyView;
  /** Tints the whole figure one flat colour (dark cards, tiny icons). Default: the full render. */
  fill?: string;
  /** Colour of lit areas. */
  glowColor?: string;
  /** Square crop around one area, for small icons. */
  crop?: AreaId;
  /** Faintly outline every area that can be tapped (body map). */
  segmented?: boolean;
  /** A check badge on each fully lit area (body map). */
  badges?: boolean;
  /** Draw only the lit areas, to layer over a plain figure (animated highlights). */
  overlay?: boolean;
};

export function BodyFigure({ height, glows = {}, view, fill, glowColor = colors.green, crop, segmented, badges, overlay }: FigureProps) {
  const side: BodyView = view ?? 'front';
  const [cx, cy, cs] = crop ? AREA_CROP[crop] : [0, 0, 440];
  // Points per figure unit, and where the full figure sits inside the box.
  const scale = height / cs;
  const width = crop ? height : height / 2;
  const lit = AREA_ORDER.filter((a) => (glows[a] ?? 0) > 0 && (!view || VISIBLE[view].includes(a)));
  // Without a view, back-only areas (upper and lower back) borrow their back shape on the front figure.
  const zone = (a: AreaId) => ZONES[side][a] ?? ZONES.back[a] ?? ZONES.front[a];
  const gradId = `zone-${glowColor.replace(/[^a-zA-Z0-9]/g, '')}`;
  const tinted = !!fill && fill !== colors.figure;

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      {overlay ? null : (
        <Image
          source={BODY_IMAGE[side]}
          resizeMode="contain"
          style={[{ position: 'absolute', left: -cx * scale, top: -cy * scale, width: 220 * scale, height: 440 * scale }, tinted && { tintColor: fill }]}
        />
      )}
      <Svg width={width} height={height} viewBox={crop ? `${cx} ${cy} ${cs} ${cs}` : '0 0 220 440'} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={gradId} x1={0} y1={0} x2={0} y2={440} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={glowColor} stopOpacity={0.92} />
            <Stop offset="1" stopColor={glowColor} stopOpacity={0.78} />
          </LinearGradient>
        </Defs>
        {segmented
          ? VISIBLE[side]
              .filter((a) => !lit.includes(a))
              .map((a) => <Path key={a} d={zone(a)} fill="rgba(47,122,86,0.05)" stroke="rgba(255,255,255,0.5)" strokeWidth={1} strokeLinejoin="round" />)
          : null}
        {lit.map((a) => (
          <G key={a} opacity={glows[a]}>
            <Path d={zone(a)} fill={tinted ? glowColor : `url(#${gradId})`} stroke="rgba(255,255,255,0.65)" strokeWidth={1} strokeLinejoin="round" />
          </G>
        ))}
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
    </View>
  );
}

type MapProps = {
  view: BodyView;
  selected: AreaId[];
  onToggle: (area: AreaId) => void;
  height?: number;
};

/** Tappable body map: every area is outlined on the figure, selected ones fill in. Paired areas share one selection. */
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

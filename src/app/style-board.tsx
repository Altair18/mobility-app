// Style board: the same icons and figures drawn in three candidate directions, for the team to choose from.
// Temporary — delete once a direction is chosen.
import { useId, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, LinearGradient, Mask, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { BodyFigure } from '@/components/BodyFigure';
import { Icon, type IconName } from '@/components/Icon';
import { PoseBubble, usePoseMotion } from '@/components/PoseBubble';
import { T } from '@/components/T';
import { OptionPill, Screen } from '@/components/ui';
import { colors, fonts, REGION_COLORS } from '@/constants/theme';
import { DETAIL, OUTLINE } from '@/data/figure';
import type { Pose } from '@/data/poses';

type Name = 'home' | 'plan' | 'progress' | 'settings' | 'flame' | 'lock';
type IconProps = { name: Name; on?: boolean; size?: number };

const TABS: [Name, string][] = [
  ['home', 'Today'],
  ['plan', 'Plan'],
  ['progress', 'Progress'],
  ['settings', 'Settings'],
];
const FLAME = 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5 1-8.5z';
const MOVE_COLOR = REGION_COLORS.lowerBack;
const SKIN = ['#EDE3CF', '#E2D5BC', '#D1C0A0'];

function uid(raw: string) {
  return raw.replace(/[^a-zA-Z0-9]/g, '');
}

/* ───────────── Current ───────────── */

const CURRENT: Record<Name, IconName> = { home: 'home', plan: 'calendar', progress: 'bars', settings: 'sliders', flame: 'flame', lock: 'lock' };

function CurrentIcon({ name, on, size = 24 }: IconProps) {
  return <Icon name={CURRENT[name]} size={size} color={name === 'flame' ? colors.flame : on ? colors.ink : colors.muted} />;
}

/* ───────────── 1 · Soft and tactile ───────────── */

function SoftIcon({ name, on, size = 26 }: IconProps) {
  const stroke = on ? colors.green : colors.muted;
  const fill = on ? colors.green : 'rgba(47,122,86,0.16)';
  const detail = on ? colors.cream : colors.muted;
  const s = { stroke, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const d = { stroke: detail, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  let body: ReactNode = null;
  switch (name) {
    case 'home':
      body = (
        <>
          <Path d="M4 11.2 L12 4.5 L20 11.2 V18.5 Q20 20.5 18 20.5 H6 Q4 20.5 4 18.5 Z" fill={fill} {...s} />
          <Path d="M10 20.5 V16.5 Q10 14.5 12 14.5 Q14 14.5 14 16.5 V20.5" {...d} />
        </>
      );
      break;
    case 'plan':
      body = (
        <>
          <Rect x={4} y={5} width={16} height={15.5} rx={3.5} fill={fill} {...s} />
          <Path d="M4 10 H20 M9 3.5 V6.5 M15 3.5 V6.5" {...s} fill="none" />
          {[9, 12, 15].map((x) => (
            <Circle key={x} cx={x} cy={14.8} r={1.1} fill={detail} />
          ))}
        </>
      );
      break;
    case 'progress':
      body = (
        <>
          <Rect x={4.5} y={12} width={4} height={8.5} rx={2} fill={fill} {...s} />
          <Rect x={10} y={4.5} width={4} height={16} rx={2} fill={fill} {...s} />
          <Rect x={15.5} y={9} width={4} height={11.5} rx={2} fill={fill} {...s} />
        </>
      );
      break;
    case 'settings':
      body = (
        <>
          <Path d="M4 8 H20 M4 16 H20" {...s} fill="none" />
          <Circle cx={15} cy={8} r={2.9} fill={on ? colors.green : '#FFFDF9'} {...s} />
          <Circle cx={9} cy={16} r={2.9} fill={on ? colors.green : '#FFFDF9'} {...s} />
        </>
      );
      break;
    case 'flame':
      body = <Path d={FLAME} fill={on ? colors.flame : 'rgba(232,119,42,0.2)'} stroke={colors.flame} strokeWidth={1.8} strokeLinejoin="round" />;
      break;
    case 'lock':
      body = (
        <>
          <Path d="M8 10.5 V8 a4 4 0 0 1 8 0 V10.5" {...s} fill="none" />
          <Rect x={5} y={10.5} width={14} height={10} rx={3} fill={fill} {...s} />
          <Circle cx={12} cy={15.5} r={1.4} fill={detail} />
        </>
      );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body}
    </Svg>
  );
}

/** The soft shaded character from the body map, applied to a move. */
function SoftMove({ pose, size }: { pose: Pose; size: number }) {
  const id = uid(useId());
  const parts = (near: string, far: string, extra = 0) => (
    <>
      {pose.back ? <Path d={pose.back} stroke={far} strokeWidth={8 + extra} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
      <Path d={pose.torso} stroke={near} strokeWidth={14.5 + extra} fill="none" strokeLinecap="round" />
      <Path d={pose.limbs} stroke={near} strokeWidth={8.5 + extra} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={pose.h[0]} cy={pose.h[1]} r={7.6 + extra / 2} fill={near} />
    </>
  );
  return (
    <View style={[styles.bubble, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#F4ECDD' }]}>
      <Svg width="100%" height="100%" viewBox="6 10 88 88">
        <Defs>
          <LinearGradient id={`skin${id}`} x1={0} y1={0} x2={100} y2={0} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={SKIN[0]} />
            <Stop offset="0.55" stopColor={SKIN[1]} />
            <Stop offset="1" stopColor={SKIN[2]} />
          </LinearGradient>
          <RadialGradient id={`glow${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.green} stopOpacity={1} />
            <Stop offset="0.5" stopColor={colors.green} stopOpacity={0.6} />
            <Stop offset="1" stopColor={colors.green} stopOpacity={0} />
          </RadialGradient>
          <Mask id={`mask${id}`} maskUnits="userSpaceOnUse" x={0} y={0} width={100} height={100}>
            {parts('#FFFFFF', '#FFFFFF')}
          </Mask>
        </Defs>
        <Circle cx={50} cy={54} r={38} fill={MOVE_COLOR} opacity={0.35} />
        <Ellipse cx={50} cy={86} rx={32} ry={4} fill="rgba(60,40,20,0.12)" />
        {parts('rgba(150,126,88,0.55)', 'rgba(150,126,88,0.45)', 1.6)}
        {parts(`url(#skin${id})`, '#D6C6A8')}
        <Ellipse cx={pose.d[0]} cy={pose.d[1]} rx={11} ry={11} fill={`url(#glow${id})`} mask={`url(#mask${id})`} />
      </Svg>
    </View>
  );
}

/* ───────────── 2 · Editorial line ───────────── */

function LineIcon({ name, on, size = 26 }: IconProps) {
  const s = { stroke: on ? colors.ink : colors.faint, strokeWidth: 1.3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  let body: ReactNode = null;
  switch (name) {
    case 'home':
      body = <Path d="M4.5 10.5 L12 4.5 L19.5 10.5 M6.5 9 V19.5 H17.5 V9 M10.5 19.5 V15.5 H13.5 V19.5" {...s} />;
      break;
    case 'plan':
      body = (
        <>
          <Rect x={4.5} y={5.5} width={15} height={14} rx={1.5} {...s} />
          <Path d="M4.5 9.5 H19.5 M8.5 3.5 V7 M15.5 3.5 V7 M9.5 14.5 L11.2 16.2 L14.5 12.8" {...s} />
        </>
      );
      break;
    case 'progress':
      body = (
        <>
          <Path d="M4.5 20 H19.5 M7.5 20 V14 M12 20 V7.5 M16.5 20 V11 M7.5 14 L12 7.5 L16.5 11" {...s} />
          {[
            [7.5, 14],
            [12, 7.5],
            [16.5, 11],
          ].map(([x, y]) => (
            <Circle key={x} cx={x} cy={y} r={1.3} fill="#FFF8EC" stroke={s.stroke} strokeWidth={1.3} />
          ))}
        </>
      );
      break;
    case 'settings':
      body = (
        <>
          <Path d="M4 8 H12.8 M17.2 8 H20 M4 16 H6.8 M11.2 16 H20" {...s} />
          <Circle cx={15} cy={8} r={2.2} {...s} />
          <Circle cx={9} cy={16} r={2.2} {...s} />
        </>
      );
      break;
    case 'flame':
      body = (
        <>
          <Path d={FLAME} {...s} stroke={colors.flame} />
          <Path d="M12 18 C10.6 18 10 16.9 10.3 15.6 C10.6 14.4 11.6 13.8 12 12.6 C12.6 13.9 13.8 14.6 13.8 16.1 C13.8 17.2 13.1 18 12 18 Z" {...s} stroke={colors.flame} />
        </>
      );
      break;
    case 'lock':
      body = (
        <>
          <Rect x={5.5} y={11} width={13} height={9.5} rx={1.5} {...s} />
          <Path d="M8.5 11 V8 a3.5 3.5 0 0 1 7 0 V11 M12 14.5 V17" {...s} />
        </>
      );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body}
    </Svg>
  );
}

/** Outline-only body with the glow as the only colour. */
function LineBody({ height }: { height: number }) {
  const id = uid(useId());
  return (
    <Svg width={height / 2} height={height} viewBox="0 0 220 440">
      <Defs>
        <RadialGradient id={`glow${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={colors.green} stopOpacity={0.85} />
          <Stop offset="1" stopColor={colors.green} stopOpacity={0} />
        </RadialGradient>
        <ClipPath id={`clip${id}`}>
          <Path d={OUTLINE} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#clip${id})`}>
        <Ellipse cx={110} cy={186} rx={46} ry={32} fill={`url(#glow${id})`} />
      </G>
      {DETAIL.front.map((d) => (
        <Path key={d} d={d} stroke={colors.ink} strokeOpacity={0.3} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      ))}
      <Path d={OUTLINE} fill="none" stroke={colors.ink} strokeWidth={2.4} strokeLinejoin="round" />
    </Svg>
  );
}

const PAPER = '#FFFDF9';

function LineMove({ pose, size }: { pose: Pose; size: number }) {
  const id = uid(useId());
  const s = { stroke: colors.ink, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <View style={[styles.bubble, { width: size, height: size, borderRadius: size / 2, backgroundColor: '#FFFDF9', borderWidth: 1, borderColor: 'rgba(28,26,22,0.18)' }]}>
      <Svg width="100%" height="100%" viewBox="6 10 88 88">
        <Defs>
          <RadialGradient id={`glow${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.green} stopOpacity={0.9} />
            <Stop offset="1" stopColor={colors.green} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Path d="M14 84.5 H86" stroke={colors.ink} strokeOpacity={0.25} strokeWidth={1} />
        {/* Each part is a wide ink stroke with a paper stroke inside it, leaving a fine outlined capsule. */}
        {pose.back ? (
          <>
            <Path d={pose.back} {...s} strokeOpacity={0.45} strokeWidth={8} />
            <Path d={pose.back} {...s} stroke={PAPER} strokeWidth={5.6} />
          </>
        ) : null}
        <Path d={pose.torso} {...s} strokeWidth={14} />
        <Path d={pose.torso} {...s} stroke={PAPER} strokeWidth={11.6} />
        <Path d={pose.limbs} {...s} strokeWidth={8.5} />
        <Path d={pose.limbs} {...s} stroke={PAPER} strokeWidth={6.1} />
        <Circle cx={pose.h[0]} cy={pose.h[1]} r={7.6} fill={colors.ink} />
        <Circle cx={pose.h[0]} cy={pose.h[1]} r={6.4} fill={PAPER} />
        <Ellipse cx={pose.d[0]} cy={pose.d[1]} rx={9} ry={9} fill={`url(#glow${id})`} />
      </Svg>
    </View>
  );
}

/* ───────────── 3 · Geometric shapes ───────────── */

const GEO_OFF = '#A8987E';
const GEO_ACCENT = '#D49A7C';

function GeoIcon({ name, on, size = 26 }: IconProps) {
  const main = on ? colors.green : GEO_OFF;
  const accent = on ? GEO_ACCENT : '#FFF8EC';
  let body: ReactNode = null;
  switch (name) {
    case 'home':
      body = (
        <>
          <Path d="M3.5 12 L12 4 L20.5 12 Z" fill={main} stroke={main} strokeWidth={1.5} strokeLinejoin="round" />
          <Rect x={5.5} y={10.5} width={13} height={10} rx={2} fill={main} />
          <Path d="M10 20.5 V17 a2 2 0 0 1 4 0 V20.5 Z" fill={accent} />
        </>
      );
      break;
    case 'plan':
      body = (
        <>
          <Rect x={4} y={4.5} width={16} height={16} rx={4} fill={main} />
          <Rect x={4} y={4.5} width={16} height={5} rx={2.5} fill={accent} />
          {[
            [8.5, 13.5],
            [12, 13.5],
            [15.5, 13.5],
            [8.5, 17],
            [12, 17],
          ].map(([x, y]) => (
            <Circle key={`${x}${y}`} cx={x} cy={y} r={1.2} fill="#FFF8EC" />
          ))}
        </>
      );
      break;
    case 'progress':
      body = (
        <>
          <Rect x={4} y={13} width={4.5} height={8} rx={2.25} fill={main} />
          <Rect x={9.75} y={4} width={4.5} height={17} rx={2.25} fill={on ? GEO_ACCENT : main} />
          <Rect x={15.5} y={9} width={4.5} height={12} rx={2.25} fill={main} />
        </>
      );
      break;
    case 'settings':
      body = (
        <>
          <Rect x={3} y={6} width={18} height={4} rx={2} fill={main} />
          <Rect x={3} y={14} width={18} height={4} rx={2} fill={main} />
          <Circle cx={15} cy={8} r={3.6} fill={on ? GEO_ACCENT : '#FFF8EC'} stroke={main} strokeWidth={on ? 0 : 1.6} />
          <Circle cx={9} cy={16} r={3.6} fill={on ? GEO_ACCENT : '#FFF8EC'} stroke={main} strokeWidth={on ? 0 : 1.6} />
        </>
      );
      break;
    case 'flame':
      body = (
        <>
          <Path d="M12 2.5 C15 7 18.5 9.5 18.5 14.5 A6.5 6.5 0 0 1 5.5 14.5 C5.5 9.5 9 7 12 2.5 Z" fill={on ? colors.flame : GEO_OFF} />
          <Circle cx={12} cy={15.5} r={2.8} fill={on ? '#FFD27A' : '#FFF8EC'} />
        </>
      );
      break;
    case 'lock':
      body = (
        <>
          <Path d="M8 10.5 V8 a4 4 0 0 1 8 0 V10.5" stroke={main} strokeWidth={3} fill="none" strokeLinecap="round" />
          <Rect x={4.5} y={10} width={15} height={11.5} rx={3.5} fill={main} />
          <Circle cx={12} cy={15.5} r={1.8} fill={accent} />
        </>
      );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body}
    </Svg>
  );
}

/** The body built from a few simple shapes in flat colour. */
function GeoBody({ height }: { height: number }) {
  const fill = '#D9BE93';
  return (
    <Svg width={height / 2} height={height} viewBox="0 0 220 440">
      <Circle cx={110} cy={42} r={30} fill={fill} />
      <Path d="M62 108 L44 268 M158 108 L176 268" stroke={fill} strokeWidth={24} strokeLinecap="round" />
      <Path d="M95 236 L90 420 M125 236 L130 420" stroke={fill} strokeWidth={32} strokeLinecap="round" />
      <Rect x={70} y={86} width={80} height={156} rx={34} fill={fill} />
      <Rect x={82} y={168} width={56} height={34} rx={17} fill={colors.green} />
      <Circle cx={110} cy={185} r={6} fill="#FFF8EC" />
    </Svg>
  );
}

function GeoMove({ pose, size }: { pose: Pose; size: number }) {
  const ink = '#2B2620';
  const s = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <View style={[styles.bubble, { width: size, height: size, borderRadius: size / 2, backgroundColor: MOVE_COLOR }]}>
      <Svg width="100%" height="100%" viewBox="6 10 88 88">
        <Rect x={0} y={84} width={100} height={20} fill="rgba(28,26,22,0.12)" />
        {pose.back ? <Path d={pose.back} {...s} stroke="#5A5047" strokeWidth={9} /> : null}
        <Path d={pose.torso} {...s} stroke={ink} strokeWidth={16} />
        <Path d={pose.limbs} {...s} stroke={ink} strokeWidth={10} />
        <Circle cx={pose.h[0]} cy={pose.h[1]} r={8.4} fill={ink} />
        <Circle cx={pose.d[0]} cy={pose.d[1]} r={5.6} fill={colors.green} stroke="#FFF8EC" strokeWidth={2.2} />
      </Svg>
    </View>
  );
}

/* ───────────── Board ───────────── */

type Direction = {
  key: string;
  title: string;
  blurb: string;
  Icon: (p: IconProps) => ReactNode;
  /** How the selected tab is marked. */
  mark: 'label' | 'dot' | 'bold';
  body: (h: number) => ReactNode;
  move: (pose: Pose, size: number) => ReactNode;
};

const DIRECTIONS: Direction[] = [
  {
    key: 'current',
    title: 'Current',
    blurb: 'For reference: what the app uses today.',
    Icon: CurrentIcon,
    mark: 'label',
    body: (h) => <BodyFigure height={h} glows={{ lowerBack: 1 }} />,
    move: () => null,
  },
  {
    key: 'soft',
    title: '1 · Soft and tactile',
    blurb: 'Two-tone icons that fill in when selected. One soft, shaded character everywhere, from the body map to every move.',
    Icon: SoftIcon,
    mark: 'label',
    body: (h) => <BodyFigure height={h} glows={{ lowerBack: 1 }} />,
    move: (pose, size) => <SoftMove pose={pose} size={size} />,
  },
  {
    key: 'line',
    title: '2 · Editorial line',
    blurb: 'Fine 1.3px lines with a dot under the selected tab. Outline figures, with the green glow as the only colour.',
    Icon: LineIcon,
    mark: 'dot',
    body: (h) => <LineBody height={h} />,
    move: (pose, size) => <LineMove pose={pose} size={size} />,
  },
  {
    key: 'geo',
    title: '3 · Geometric shapes',
    blurb: 'Solid icons built from simple shapes, with a second colour when selected. Figures built from circles and capsules in flat colour.',
    Icon: GeoIcon,
    mark: 'bold',
    body: (h) => <GeoBody height={h} />,
    move: (pose, size) => <GeoMove pose={pose} size={size} />,
  },
];

function TabBarMock({ d }: { d: Direction }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map(([name, label], i) => {
        const on = i === 0;
        return (
          <View key={name} style={[styles.tab, on && d.mark === 'label' && d.key !== 'current' && styles.tabOnSoft, on && d.key === 'current' && styles.tabOnCurrent]}>
            <d.Icon name={name} on={on} size={24} />
            <T style={[styles.tabLabel, on && { color: d.key === 'soft' ? colors.greenText : colors.ink }, on && d.mark === 'bold' && { fontFamily: fonts.bold }]}>{label}</T>
            {d.mark === 'dot' ? <View style={[styles.tabDot, !on && { opacity: 0 }]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

export default function StyleBoard() {
  const [playing, setPlaying] = useState(true);
  const cat = usePoseMotion('cat', playing);

  return (
    <Screen scroll>
      <T variant="title">Style board</T>
      <T variant="small" style={styles.sub}>
        The same icons and figures in three directions. The moves show cat–cow, animated.
      </T>
      <View style={styles.toggleRow}>
        <OptionPill label={playing ? 'Pause motion' : 'Play motion'} selected={playing} onPress={() => setPlaying((p) => !p)} style={styles.toggle} />
      </View>

      {DIRECTIONS.map((d) => (
        <View key={d.key} style={[styles.section, d.key === 'current' && styles.current]}>
          <T variant="h2">{d.title}</T>
          <T variant="small" style={styles.blurb}>
            {d.blurb}
          </T>

          <TabBarMock d={d} />

          <View style={styles.chips}>
            <View style={styles.chip}>
              <d.Icon name="flame" on size={18} />
              <T style={styles.chipText}>6</T>
            </View>
            <View style={styles.chip}>
              <d.Icon name="lock" size={16} />
              <T variant="caption">Premium</T>
            </View>
            <View style={styles.chip}>
              <d.Icon name="lock" on size={16} />
              <T variant="caption" color={colors.ink}>
                Selected
              </T>
            </View>
          </View>

          <View style={styles.figures}>
            {d.body(176)}
            {d.key === 'current' ? <PoseBubble pose="cat" size={128} color={MOVE_COLOR} breathe={playing} shadow /> : d.move(cat, 128)}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: 6 },
  toggleRow: { marginTop: 14, flexDirection: 'row' },
  toggle: { minHeight: 36, paddingHorizontal: 14 },
  section: { marginTop: 22, padding: 18, borderRadius: 26, backgroundColor: 'rgba(255,253,249,0.75)', borderWidth: 1, borderColor: colors.border },
  current: { backgroundColor: 'rgba(255,253,249,0.35)', borderStyle: 'dashed' },
  blurb: { marginTop: 4 },
  tabBar: {
    marginTop: 16,
    height: 64,
    borderRadius: 32,
    paddingHorizontal: 6,
    backgroundColor: '#FBF3E6',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: { flex: 1, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabOnSoft: { backgroundColor: 'rgba(47,122,86,0.10)' },
  tabOnCurrent: { backgroundColor: 'rgba(90,70,40,0.08)' },
  tabLabel: { fontFamily: fonts.semibold, fontSize: 11, color: colors.muted },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.green },
  chips: { marginTop: 14, flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    backgroundColor: '#FFFBF4',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: { fontFamily: fonts.bold, fontSize: 14, color: colors.flameText },
  figures: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  bubble: { overflow: 'hidden' },
});

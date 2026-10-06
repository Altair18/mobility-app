import { useEffect, useId, useState } from 'react';
import { Animated, Easing, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, G, LinearGradient, Mask, Path, RadialGradient, Stop } from 'react-native-svg';

import { colors, NATIVE_DRIVER, shadows } from '@/constants/theme';
import { MOTION, POSES, type Pose } from '@/data/poses';
import { mix } from '@/lib/color';
import type { PoseKey } from '@/data/types';

type Props = {
  pose: PoseKey;
  size: number;
  color: string;
  /** Green glow on the area being stretched. */
  dot?: boolean;
  /** Thin cream outline, for overlapping stacks. */
  outline?: boolean;
  shadow?: boolean;
  /** Play the move: moves with a second keyframe blend between the two, others breathe gently. */
  breathe?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** One full breath (in and out) per movement cycle. */
const BREATH_MS = 8000;

const NUMBER = /-?\d+(?:\.\d+)?/g;

/** Moves every number in path `a` towards the matching number in `b` (both share the same commands). */
function blendPath(a: string, b: string, t: number): string {
  if (t === 0 || a === b) return a;
  const target = b.match(NUMBER) ?? [];
  let i = 0;
  return a.replace(NUMBER, (n) => {
    const from = Number(n);
    return (from + (Number(target[i++]) - from) * t).toFixed(2);
  });
}

function blend(a: Pose, b: Pose | undefined, t: number): Pose {
  if (!b || t === 0) return a;
  const mix = (x: number, y: number) => x + (y - x) * t;
  return {
    torso: blendPath(a.torso, b.torso, t),
    back: blendPath(a.back, b.back, t),
    limbs: blendPath(a.limbs, b.limbs, t),
    h: [mix(a.h[0], b.h[0]), mix(a.h[1], b.h[1])],
    d: [mix(a.d[0], b.d[0]), mix(a.d[1], b.d[1])],
  };
}

/** The pose to draw right now: moves with a second keyframe blend between the two while playing. */
export function usePoseMotion(pose: PoseKey, playing: boolean): Pose {
  const motion = MOTION[pose];
  const [t, setT] = useState(0);

  // Moves with a second keyframe blend between the two, eased like a breath: slowly in, slowly out.
  useEffect(() => {
    if (!playing || !motion) return;
    let frame = 0;
    let last = 0;
    const start = Date.now();
    const step = () => {
      const now = Date.now();
      // About 30 updates a second is smooth at this pace and keeps re-renders cheap.
      if (now - last > 32) {
        last = now;
        setT((1 - Math.cos(((now - start) / BREATH_MS) * Math.PI * 2)) / 2);
      }
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing, motion]);

  // Paused or still: show the starting frame.
  return blend(POSES[pose], motion, playing ? t : 0);
}

type Pt = [number, number];

/** Same skin as the body map: light on the left, shade on the right. */
const SKIN = ['#EDE3CF', '#E2D5BC', '#D1C0A0'];
const SKIN_FAR = '#D3C3A4';
const EDGE = 'rgba(140,114,78,0.55)';

/** Radii from the body outwards: upper leg, lower leg, foot… and the same for arms. */
const LEG = [5, 3.9, 3.2, 2.8];
const ARM = [4, 3.2, 2.7, 2.4];
/** The torso widens from hips to chest. */
const HIP = 6.3;
const CHEST = 7.9;

const fmt = (n: number) => n.toFixed(2);

/** The strokes in a pose path as lists of points; curves are sampled into short straight runs. */
function strokes(d: string): Pt[][] {
  const tokens = d.match(/[MLQ]|-?\d+(?:\.\d+)?/g) ?? [];
  const out: Pt[][] = [];
  let line: Pt[] = [];
  let i = 0;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (cmd === 'M') {
      line = [[num(), num()]];
      out.push(line);
    } else if (cmd === 'L') {
      line.push([num(), num()]);
    } else if (cmd === 'Q') {
      const [sx, sy] = line[line.length - 1];
      const [cx, cy, ex, ey] = [num(), num(), num(), num()];
      for (let k = 1; k <= 6; k++) {
        const u = k / 6;
        line.push([(1 - u) ** 2 * sx + 2 * (1 - u) * u * cx + u * u * ex, (1 - u) ** 2 * sy + 2 * (1 - u) * u * cy + u * u * ey]);
      }
    }
  }
  return out;
}

const circle = (x: number, y: number, r: number) => `M${fmt(x - r)} ${fmt(y)}a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(2 * r)} 0a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(-2 * r)} 0Z`;

/**
 * A tapered limb: a circle at every joint, joined by the band between neighbouring circles.
 * Every piece winds the same way, so they fill as one smooth shape.
 */
function chain(points: Pt[], radii: number[], grow: number): string {
  let d = '';
  points.forEach(([x, y], i) => (d += circle(x, y, radii[i] + grow)));
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay] = points[i];
    const [bx, by] = points[i + 1];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    const ra = radii[i] + grow;
    const rb = radii[i + 1] + grow;
    d += `M${fmt(ax + nx * ra)} ${fmt(ay + ny * ra)}L${fmt(bx + nx * rb)} ${fmt(by + ny * rb)}L${fmt(bx - nx * rb)} ${fmt(by - ny * rb)}L${fmt(ax - nx * ra)} ${fmt(ay - ny * ra)}Z`;
  }
  return d;
}

type Body = { far: string; torso: string; limbs: string; head: string };

/** Turns a pose into filled body shapes, `grow` units larger all round (for outlines). */
function body(p: Pose, grow: number): Body {
  const [torso] = strokes(p.torso);
  const hip = torso[0];
  const chest = torso[torso.length - 1];
  // Limbs start at the hip (legs) or at the chest (arms).
  const limb = (pts: Pt[]) => {
    const isLeg = Math.hypot(pts[0][0] - hip[0], pts[0][1] - hip[1]) < Math.hypot(pts[0][0] - chest[0], pts[0][1] - chest[1]);
    return chain(pts, isLeg ? LEG : ARM, grow);
  };
  const torsoRadii = torso.map((_, i) => HIP + (CHEST - HIP) * (i / Math.max(1, torso.length - 1)));

  // The head is an oval along the line of the neck, so it tilts with the body.
  const [hx, hy] = p.h;
  const len = Math.hypot(hx - chest[0], hy - chest[1]) || 1;
  const vx = (hx - chest[0]) / len;
  const vy = (hy - chest[1]) / len;
  const rx = 6.5 + grow;
  const ry = 7.6 + grow;
  const angle = (Math.atan2(vx, -vy) * 180) / Math.PI;
  const [sx, sy] = [hx + vy * rx, hy - vx * rx];
  const [ex, ey] = [hx - vy * rx, hy + vx * rx];
  const head = `M${fmt(sx)} ${fmt(sy)}A${fmt(rx)} ${fmt(ry)} ${fmt(angle)} 1 0 ${fmt(ex)} ${fmt(ey)}A${fmt(rx)} ${fmt(ry)} ${fmt(angle)} 1 0 ${fmt(sx)} ${fmt(sy)}Z`;

  return {
    far: strokes(p.back).map(limb).join(''),
    torso: chain(torso, torsoRadii, grow) + chain([chest, p.h], [3.4, 3], grow),
    limbs: strokes(p.limbs).map(limb).join(''),
    head,
  };
}

/** The whole figure in one colour: for the drop shadow and the glow mask. */
function Silhouette({ b, color }: { b: Body; color: string }) {
  return (
    <>
      {b.far ? <Path d={b.far} fill={color} /> : null}
      <Path d={b.torso} fill={color} />
      <Path d={b.limbs} fill={color} />
      <Path d={b.head} fill={color} />
    </>
  );
}

/** Far limbs first, then the near body, each with a fine outline like the body map. */
function Figure({ b, edge, skin }: { b: Body; edge: Body; skin: string }) {
  return (
    <>
      {b.far ? (
        <>
          <Path d={edge.far} fill={EDGE} />
          <Path d={b.far} fill={SKIN_FAR} />
        </>
      ) : null}
      <Path d={edge.torso} fill={EDGE} />
      <Path d={edge.limbs} fill={EDGE} />
      <Path d={edge.head} fill={EDGE} />
      <Path d={b.torso} fill={skin} />
      <Path d={b.limbs} fill={skin} />
      <Path d={b.head} fill={skin} />
    </>
  );
}

/** One move drawn with the app's character inside a round bubble, tinted by the body region it works. */
export function PoseBubble({ pose, size, color, dot = true, outline, shadow, breathe, style }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const motion = MOTION[pose];
  const [scale] = useState(() => new Animated.Value(1));
  // Other moves breathe with a gentle scale.
  useEffect(() => {
    if (!breathe || motion) {
      scale.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.035, duration: BREATH_MS / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE_DRIVER }),
        Animated.timing(scale, { toValue: 1, duration: BREATH_MS / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE_DRIVER }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, motion, scale]);

  const p = usePoseMotion(pose, !!breathe);
  const shape = body(p, 0);
  const edge = body(p, 0.85);
  const skinId = `skin${uid}`;
  const floorId = `floor${uid}`;
  const glowId = `glow${uid}`;
  const maskId = `mask${uid}`;

  return (
    <Animated.View
      style={[
        { width: size, height: size, borderRadius: size / 2, transform: [{ scale }] },
        shadow && { boxShadow: size > 120 ? '0px 18px 34px -16px rgba(70,50,20,0.5)' : shadows.bubble },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          borderRadius: size / 2,
          // Softened towards cream, so the skin-toned figure stands out against it.
          backgroundColor: mix(color, colors.cream, 0.55),
          overflow: 'hidden',
          borderWidth: outline ? 2 : 0,
          borderColor: '#FFFDF9',
        }}
      >
        <Svg width="100%" height="100%" viewBox="6 10 88 88">
          <Defs>
            <LinearGradient id={skinId} x1={20} y1={15} x2={85} y2={90} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={SKIN[0]} />
              <Stop offset="0.55" stopColor={SKIN[1]} />
              <Stop offset="1" stopColor={SKIN[2]} />
            </LinearGradient>
            <RadialGradient id={floorId} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#3C2814" stopOpacity={0.24} />
              <Stop offset="1" stopColor="#3C2814" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={colors.green} stopOpacity={0.95} />
              <Stop offset="0.35" stopColor={colors.green} stopOpacity={0.6} />
              <Stop offset="0.7" stopColor={colors.green} stopOpacity={0.18} />
              <Stop offset="1" stopColor={colors.green} stopOpacity={0} />
            </RadialGradient>
            {dot ? (
              <Mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={100} height={100}>
                <Silhouette b={shape} color="#FFFFFF" />
              </Mask>
            ) : null}
          </Defs>

          <Ellipse cx={50} cy={86} rx={34} ry={4.5} fill={`url(#${floorId})`} />
          <G transform="translate(0.6 1.4)" opacity={0.14}>
            <Silhouette b={edge} color="#3C2814" />
          </G>
          <Figure b={shape} edge={edge} skin={`url(#${skinId})`} />
          {dot ? <Ellipse cx={p.d[0]} cy={p.d[1]} rx={15} ry={15} fill={`url(#${glowId})`} mask={`url(#${maskId})`} /> : null}
        </Svg>
      </View>
    </Animated.View>
  );
}

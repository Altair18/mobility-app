import { useEffect, useRef, useState } from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { Motion, Pose, Pt } from '@/data/motionTypes';
import { MOTIONS, POSE_MOTION } from '@/data/motions';
import type { PoseKey } from '@/data/types';

const FLOOR = 85;
const FPS = 30;

/** The motion for a move id, falling back to the pose's representative move. */
export function motionFor(move?: string, pose?: PoseKey): Motion {
  return (move && MOTIONS[move]) || (pose && MOTIONS[POSE_MOTION[pose]]) || MOTIONS['sh-reach'];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const smooth = (u: number) => u * u * (3 - 2 * u);

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  return {
    ...a,
    hip: lerpPt(a.hip, b.hip, t),
    sh: lerpPt(a.sh, b.sh, t),
    head: lerpPt(a.head, b.head, t),
    armF: [lerpPt(a.armF[0], b.armF[0], t), lerpPt(a.armF[1], b.armF[1], t)],
    armB: [lerpPt(a.armB[0], b.armB[0], t), lerpPt(a.armB[1], b.armB[1], t)],
    legF: [lerpPt(a.legF[0], b.legF[0], t), lerpPt(a.legF[1], b.legF[1], t), lerpPt(a.legF[2], b.legF[2], t)],
    legB: [lerpPt(a.legB[0], b.legB[0], t), lerpPt(a.legB[1], b.legB[1], t), lerpPt(a.legB[2], b.legB[2], t)],
    handF: a.handF && b.handF ? lerpPt(a.handF, b.handF, t) : a.handF,
    handB: a.handB && b.handB ? lerpPt(a.handB, b.handB, t) : a.handB,
    spine: lerp(a.spine ?? 0, b.spine ?? 0, t),
    nose: a.nose !== undefined && b.nose !== undefined ? lerp(a.nose, b.nose, t) : a.nose,
  };
}

/** The pose at `seconds` into the motion. */
export function samplePose(motion: Motion, seconds: number): Pose {
  const { frames, period, loop, hold } = motion;
  const n = frames.length;
  if (n === 1) return frames[0];
  const phase = ((seconds % period) + period) % period / period;
  if (loop === 'cycle') {
    const f = phase * n;
    const i = Math.floor(f);
    return lerpPose(frames[i], frames[(i + 1) % n], smooth(f - i));
  }
  // pingpong: 0 → 1 → 0 with a pause at each end
  let pos = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
  pos = Math.min(1, Math.max(0, (pos - hold) / (1 - 2 * hold)));
  const f = pos * (n - 1);
  const i = Math.min(n - 2, Math.floor(f));
  return lerpPose(frames[i], frames[i + 1], smooth(f - i));
}

/** Plays a motion at ~30 fps while `playing`; holds the current frame when paused. */
export function useMotionPose(motion: Motion, playing: boolean, offsetSeconds = 0): Pose {
  const clock = useRef(offsetSeconds);
  const [pose, setPose] = useState(() => samplePose(motion, offsetSeconds));
  const motionRef = useRef(motion);

  useEffect(() => {
    if (motionRef.current !== motion) {
      motionRef.current = motion;
      clock.current = offsetSeconds;
      // A new move starts from its first frame.
      setPose(samplePose(motion, offsetSeconds));
    }
  }, [motion, offsetSeconds]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = Date.now();
    let due = 0;
    const tick = () => {
      const now = Date.now();
      clock.current += (now - last) / 1000;
      last = now;
      if (now >= due) {
        due = now + 1000 / FPS;
        setPose(samplePose(motionRef.current, clock.current));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, motion]);

  return pose;
}

type Props = {
  pose: Pose;
  size: number;
  /** Viewbox crop: the bubble shows a tighter square. */
  viewBox?: string;
};

// Flat illustration palette: skin, sports top, leggings, hair, shoes, mat. Far-side limbs are a shade darker.
const SKIN = '#D9A98A';
const SKIN_FAR = '#C4906F';
const TOP = '#3F8268';
const LEGGING = '#2A2F2E';
const LEGGING_FAR = '#1C2120';
const HAIR = '#3A2A22';
const SHOE = '#F3E7D3';
const SHOE_FAR = '#D9C9AE';
const MAT = '#C9BEA8';
const HEAD_R = 6.9;

const n1 = (v: number) => v.toFixed(1);

/** A tapered capsule from a (radius r1) to b (radius r2). */
function capsule(a: Pt, b: Pt, r1: number, r2: number): string {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 0.001;
  const nx = -dy / len;
  const ny = dx / len;
  const p1 = [a[0] + nx * r1, a[1] + ny * r1];
  const p2 = [b[0] + nx * r2, b[1] + ny * r2];
  const p3 = [b[0] - nx * r2, b[1] - ny * r2];
  const p4 = [a[0] - nx * r1, a[1] - ny * r1];
  return `M${n1(p1[0])} ${n1(p1[1])} L${n1(p2[0])} ${n1(p2[1])} A${n1(r2)} ${n1(r2)} 0 0 1 ${n1(p3[0])} ${n1(p3[1])} L${n1(p4[0])} ${n1(p4[1])} A${n1(r1)} ${n1(r1)} 0 0 1 ${n1(p1[0])} ${n1(p1[1])} Z`;
}

type Radii = [number, number, number];
const ARM: Radii = [3.1, 2.6, 2.1];
const LEG: Radii = [4.4, 3.4, 2.5];

/** Two-segment limb with a rounded joint, plus a hand or a shoe at the end. */
function Limb({ base, points, radii, color, shoe, hand, id }: { base: Pt; points: Pt[]; radii: Radii; color: string; shoe?: string; hand?: Pt; id: string }) {
  const [r0, r1, r2] = radii;
  return (
    <G key={id}>
      <Path d={capsule(base, points[0], r0, r1)} fill={color} />
      <Path d={capsule(points[0], points[1], r1, r2)} fill={color} />
      <Circle cx={points[0][0]} cy={points[0][1]} r={r1 + 0.15} fill={color} />
      {shoe && points[2] ? (
        <>
          <Path d={capsule(points[1], points[2], 2.6, 2.1)} fill={shoe} />
          <Circle cx={points[1][0]} cy={points[1][1]} r={2.6} fill={shoe} />
        </>
      ) : null}
      {hand ? <Circle cx={hand[0]} cy={hand[1]} r={2.5} fill={color} /> : null}
    </G>
  );
}

/** The exercise figure: an illustrated woman (top knot, sports top, leggings) drawn on the pose rig. */
export function MoveFigure({ pose: p, size, viewBox = '0 0 100 100' }: Props) {
  const front = p.view === 'front';
  const [hx, hy] = p.hip;
  const [sx, sy] = p.sh;
  const [ex, ey] = p.head;
  const armBaseF: Pt = front ? [sx + 6.5, sy + 2] : [sx + 0.5, sy + 1];
  const armBaseB: Pt = front ? [sx - 6.5, sy + 2] : [sx - 0.5, sy + 1];
  const legBaseF: Pt = front ? [hx + 4, hy + 1] : [hx + 0.5, hy + 1];
  const legBaseB: Pt = front ? [hx - 4, hy + 1] : [hx - 0.5, hy + 1];

  const farArm = <Limb id="armB" base={armBaseB} points={p.armB} radii={ARM} color={front ? SKIN : SKIN_FAR} hand={p.handB ?? p.armB[1]} />;
  const nearArm = <Limb id="armF" base={armBaseF} points={p.armF} radii={ARM} color={SKIN} hand={p.handF ?? p.armF[1]} />;
  const farLeg = <Limb id="legB" base={legBaseB} points={p.legB} radii={LEG} color={front ? LEGGING : LEGGING_FAR} shoe={front ? SHOE : SHOE_FAR} />;
  const nearLeg = <Limb id="legF" base={legBaseF} points={p.legF} radii={LEG} color={LEGGING} shoe={SHOE} />;

  // Torso: tapered between hips and shoulders, bent by `spine`.
  const dx = sx - hx;
  const dy = sy - hy;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const wsh = front ? 8.6 : 5.6;
  const whip = front ? 7.4 : 5.2;
  const bend = (p.spine ?? 0) * 2;
  const mx = (hx + sx) / 2 + nx * bend;
  const my = (hy + sy) / 2 + ny * bend;
  const wm = (wsh + whip) / 2;
  const torso =
    `M${n1(hx + nx * whip)} ${n1(hy + ny * whip)} Q${n1(mx + nx * wm)} ${n1(my + ny * wm)} ${n1(sx + nx * wsh)} ${n1(sy + ny * wsh)} ` +
    `A${n1(wsh)} ${n1(wsh)} 0 0 0 ${n1(sx - nx * wsh)} ${n1(sy - ny * wsh)} Q${n1(mx - nx * wm)} ${n1(my - ny * wm)} ${n1(hx - nx * whip)} ${n1(hy - ny * whip)} ` +
    `A${n1(whip)} ${n1(whip)} 0 0 0 ${n1(hx + nx * whip)} ${n1(hy + ny * whip)} Z`;

  // Neck and head along the shoulder → head axis; hair cap and top knot sit on the crown.
  const hdx = ex - sx;
  const hdy = ey - sy;
  const hl = Math.hypot(hdx, hdy) || 1;
  const ux = hdx / hl;
  const uy = hdy / hl;
  const neckEnd: Pt = [sx + ux * (hl - 5), sy + uy * (hl - 5)];

  return (
    <Svg width={size} height={size} viewBox={viewBox}>
      {p.mat ? <Rect x={8} y={FLOOR + 2} width={84} height={3.2} rx={1.6} fill={MAT} /> : null}
      {p.wall !== undefined ? <Rect x={p.wall - 1} y={6} width={2} height={FLOOR - 1} rx={1} fill={MAT} /> : null}

      {farLeg}
      {front ? nearLeg : null}
      {p.behind ? farArm : null}
      {p.behind ? nearArm : null}
      {!p.behind && !front ? farArm : null}

      <Path d={torso} fill={TOP} />
      <Ellipse cx={hx} cy={hy + 1} rx={whip} ry={whip * 0.6} fill={LEGGING} />
      <Path d={capsule([sx, sy], neckEnd, 2.2, 2.2)} fill={SKIN} />
      <Circle cx={ex + ux} cy={ey + uy} r={HEAD_R + 0.8} fill={HAIR} />
      <Circle cx={ex + ux * (HEAD_R + 1.6)} cy={ey + uy * (HEAD_R + 1.6)} r={2.8} fill={HAIR} />
      <Circle cx={ex - ux * 0.6} cy={ey - uy * 0.6} r={HEAD_R} fill={SKIN} />

      {!front ? nearLeg : null}
      {!p.behind && front ? farArm : null}
      {!p.behind ? nearArm : null}
    </Svg>
  );
}

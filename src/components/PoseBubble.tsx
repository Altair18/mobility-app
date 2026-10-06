import { useEffect, useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, shadows } from '@/constants/theme';
import { MOTION, POSES, type Pose } from '@/data/poses';
import type { PoseKey } from '@/data/types';

import { MoveFigure, motionFor, useMotionPose } from './MoveFigure';

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


type BubbleProps = {
  /** The move to draw; falls back to a representative move for `pose`. */
  move?: string;
  pose: PoseKey;
  size: number;
  /** Accent colour from the caller; the bubble itself stays neutral so the figure's own colours read. */
  color?: string;
  dot?: boolean;
  /** Thin cream outline, for overlapping stacks. */
  outline?: boolean;
  shadow?: boolean;
  /** Play the move's motion. Otherwise the first frame is shown. */
  breathe?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** One move drawn as the illustrated figure inside a round bubble. */
export function PoseBubble({ move, pose, size, outline, shadow, breathe = false, style }: BubbleProps) {
  const motion = motionFor(move, pose);
  const frame = useMotionPose(motion, breathe);
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        shadow && { boxShadow: size > 120 ? '0px 18px 34px -16px rgba(70,50,20,0.5)' : shadows.bubble },
        style,
      ]}
    >
      <View style={{ flex: 1, borderRadius: size / 2, backgroundColor: colors.bubble, overflow: 'hidden', borderWidth: outline ? 2 : 1, borderColor: outline ? '#FFFDF9' : colors.border, alignItems: 'center', justifyContent: 'center' }}>
        <MoveFigure pose={frame} size={size * 0.9} viewBox="2 2 96 96" />
      </View>
    </View>
  );
}

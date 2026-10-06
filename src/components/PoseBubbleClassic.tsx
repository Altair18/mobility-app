import { useEffect, useState } from 'react';
import { Animated, Easing, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors, NATIVE_DRIVER, shadows } from '@/constants/theme';
import { POSES } from '@/data/poses';
import type { PoseKey } from '@/data/types';

type Props = {
  pose: PoseKey;
  size: number;
  color: string;
  /** Green dot on the area being stretched. */
  dot?: boolean;
  /** Thin cream outline, for overlapping stacks. */
  outline?: boolean;
  shadow?: boolean;
  /** Gentle breathing motion while a move is playing. */
  breathe?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** The previous move drawing, kept for /moves-compare. Delete once the team has chosen. */
export function PoseBubbleClassic({ pose, size, color, dot = true, outline, shadow, breathe, style }: Props) {
  const p = POSES[pose];
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!breathe) {
      scale.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.035, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE_DRIVER }),
        Animated.timing(scale, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE_DRIVER }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe, scale]);

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
          backgroundColor: color,
          overflow: 'hidden',
          borderWidth: outline ? 2 : 0,
          borderColor: '#FFFDF9',
        }}
      >
        <Svg width="100%" height="100%" viewBox="6 10 88 88">
          <Rect x={0} y={86} width={100} height={20} fill="rgba(60,40,20,0.14)" />
          {p.back ? <Path d={p.back} stroke="rgba(255,253,248,0.6)" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
          <Path d={p.torso} stroke="#FFFDF8" strokeWidth={13} fill="none" strokeLinecap="round" />
          <Path d={p.limbs} stroke="#FFFDF8" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={p.h[0]} cy={p.h[1]} r={7} fill="#FFFDF8" />
          {dot ? <Circle cx={p.d[0]} cy={p.d[1]} r={4.5} fill={colors.green} stroke="#FFFFFF" strokeWidth={2} /> : null}
        </Svg>
      </View>
    </Animated.View>
  );
}

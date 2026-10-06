import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { BodyFigure } from '@/components/BodyFigure';
import { Icon } from '@/components/Icon';
import { T } from '@/components/T';
import { Screen } from '@/components/ui';
import { colors, NATIVE_DRIVER } from '@/constants/theme';
import { areasLabel, sortAreas } from '@/data/areas';
import { GOAL_LABEL, LEVEL_NAME } from '@/data/content';
import { useAppStore } from '@/store/useAppStore';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 320;
const R = 150;
const C = 2 * Math.PI * R;
const FIGURE = 236;

export default function Building() {
  const plan = useAppStore((s) => s.plan);
  const areas = sortAreas(plan?.areas ?? []);
  const [ring] = useState(() => new Animated.Value(0));
  const [lights] = useState(() => Array.from({ length: 10 }, () => new Animated.Value(0)));
  const [lines] = useState(() => Array.from({ length: 3 }, () => new Animated.Value(0)));

  useEffect(() => {
    Animated.timing(ring, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();
    // The chosen areas light up one after another while the ring fills.
    Animated.stagger(
      Math.min(420, 1800 / Math.max(1, areas.length)),
      lights.slice(0, areas.length).map((v) => Animated.timing(v, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE_DRIVER })),
    ).start();
    Animated.stagger(
      800,
      lines.map((v) => Animated.timing(v, { toValue: 1, duration: 450, useNativeDriver: NATIVE_DRIVER })),
    ).start();
    const t = setTimeout(() => router.replace('/onboarding/plan'), 3500);
    return () => clearTimeout(t);
  }, [ring, lights, lines, areas.length]);

  const dashOffset = ring.interpolate({ inputRange: [0, 1], outputRange: [C, 0] });
  const items = plan
    ? [areasLabel(plan.areas), `${LEVEL_NAME[plan.level]} · ${GOAL_LABEL[plan.goal]}`, `${plan.days === 7 ? 'Every day' : `${plan.days} days a week`} · ${plan.minutes} min`]
    : ['', '', ''];

  return (
    <Screen>
      <View style={styles.stage}>
        <View style={styles.orbit}>
          <Svg width={SIZE} height={SIZE} style={styles.rotate}>
            <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.track} strokeWidth={3} fill="none" />
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              stroke={colors.green}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={`${C} ${C}`}
              strokeDashoffset={dashOffset}
              fill="none"
            />
          </Svg>
          <View style={styles.halo} />
          <View style={styles.figure}>
            <BodyFigure height={FIGURE} />
            {areas.map((area, i) => (
              <Animated.View key={area} style={[styles.layer, { opacity: lights[i] }]} pointerEvents="none">
                <BodyFigure height={FIGURE} glows={{ [area]: 1 }} overlay />
              </Animated.View>
            ))}
          </View>
        </View>
      </View>
      <T variant="title" center>
        Building your plan
      </T>
      <View style={styles.lines}>
        {items.map((text, i) => (
          <Animated.View
            key={i}
            style={[styles.line, { opacity: lines[i], transform: [{ translateY: lines[i].interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}
          >
            <Icon name="check" size={18} color={colors.green} strokeWidth={2.6} />
            <T variant="body" style={styles.lineText}>
              {text}
            </T>
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orbit: { width: SIZE, height: SIZE },
  rotate: { transform: [{ rotate: '-90deg' }] },
  halo: { position: 'absolute', left: 30, top: 30, width: SIZE - 60, height: SIZE - 60, borderRadius: (SIZE - 60) / 2, backgroundColor: 'rgba(47,122,86,0.07)' },
  figure: { position: 'absolute', left: SIZE / 2 - FIGURE / 4, top: SIZE / 2 - FIGURE / 2 },
  layer: { position: 'absolute', left: 0, top: 0 },
  lines: { marginTop: 18, marginBottom: 40, alignItems: 'center', gap: 10 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lineText: { color: '#3E372D', fontFamily: 'Figtree_500Medium' },
});

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { BodyFigure } from '@/components/BodyFigure';
import { T } from '@/components/T';
import { PrimaryButton, Screen } from '@/components/ui';
import { colors, fonts, NATIVE_DRIVER, shadows } from '@/constants/theme';
import { AREA_NAMES } from '@/data/areas';
import type { AreaId } from '@/data/types';
import { useViewport } from '@/lib/viewport';

/** Areas that light up in turn, with where their label sits (as a fraction of the figure's width and height). */
const TOUR: { area: AreaId; x: number; y: number }[] = [
  { area: 'lowerBack', x: 0.86, y: 0.41 },
  { area: 'hips', x: 0.14, y: 0.53 },
  { area: 'shoulders', x: 0.86, y: 0.22 },
  { area: 'neck', x: 0.14, y: 0.15 },
  { area: 'knees', x: 0.86, y: 0.74 },
];
const STEP_MS = 2400;

export default function Welcome() {
  const { height: windowHeight } = useViewport();
  const figureHeight = Math.round(Math.min(400, Math.max(280, windowHeight - 440)));
  const figureWidth = figureHeight / 2;
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(t, { toValue: TOUR.length, duration: STEP_MS * TOUR.length, easing: Easing.linear, useNativeDriver: NATIVE_DRIVER }));
    loop.start();
    return () => loop.stop();
  }, [t]);

  // Each stop fades in, holds, then fades out as the next one takes over.
  const fade = (i: number) => {
    const wrap = i === 0 ? [TOUR.length - 0.5, TOUR.length] : [];
    return t.interpolate({
      inputRange: [i - 0.5, i - 0.2, i + 0.2, i + 0.5, ...wrap].sort((a, b) => a - b),
      outputRange: i === 0 ? [0, 1, 1, 0, 0, 1] : [0, 1, 1, 0],
      extrapolate: 'clamp',
    });
  };

  return (
    <Screen>
      <View style={styles.stage}>
        <View style={{ width: figureWidth, height: figureHeight }}>
          <Svg width={figureHeight} height={figureHeight} style={[styles.halo, { left: -figureHeight / 4 }]} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id="welcomeHalo" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={colors.green} stopOpacity={0.14} />
                <Stop offset="0.6" stopColor={colors.green} stopOpacity={0.06} />
                <Stop offset="1" stopColor={colors.green} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={50} cy={50} r={50} fill="url(#welcomeHalo)" />
          </Svg>
          <BodyFigure height={figureHeight} />
          {TOUR.map(({ area }, i) => (
            <Animated.View key={area} style={[styles.layer, { opacity: fade(i) }]} pointerEvents="none">
              <BodyFigure height={figureHeight} glows={{ [area]: 1 }} overlay />
            </Animated.View>
          ))}
          {TOUR.map(({ area, x, y }, i) => {
            const right = x > 0.5;
            const opacity = fade(i);
            const shift = opacity.interpolate({ inputRange: [0, 1], outputRange: [6, 0] });
            return (
              <Animated.View
                key={`${area}-label`}
                pointerEvents="none"
                style={[
                  styles.label,
                  right ? { left: figureWidth * x - 12 } : { right: figureWidth * (1 - x) - 12 },
                  { top: figureHeight * y - 16, opacity, transform: [{ translateY: shift }] },
                ]}
              >
                <View style={styles.dot} />
                <T variant="smallStrong" style={styles.labelText}>
                  {AREA_NAMES[area]}
                </T>
              </Animated.View>
            );
          })}
        </View>
      </View>
      <T variant="hero" center>
        Move better.
      </T>
      <T variant="body" color={colors.muted} center style={styles.sub}>
        Pick the areas that feel stiff. Get a short daily routine built around them.
      </T>
      <PrimaryButton label="Get started" style={styles.cta} onPress={() => router.push('/onboarding/areas')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', top: 0 },
  layer: { position: 'absolute', left: 0, top: 0 },
  label: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    height: 32,
    paddingHorizontal: 11,
    borderRadius: 16,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(90,70,40,0.10)',
    boxShadow: shadows.small,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.green },
  labelText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  sub: { marginTop: 14, alignSelf: 'center', maxWidth: 300, fontSize: 17, lineHeight: 25 },
  cta: { marginTop: 32, marginBottom: 8 },
});

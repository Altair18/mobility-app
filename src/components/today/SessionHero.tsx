import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { HoldToStart } from '@/components/HoldToStart';
import { Icon, type IconName } from '@/components/Icon';
import { PoseBubble } from '@/components/PoseBubble';
import { T } from '@/components/T';
import { Card, PrimaryButton } from '@/components/ui';
import type { LookTokens } from '@/constants/looks';
import { fonts, NATIVE_DRIVER, POSE_COLORS, REGION_COLORS } from '@/constants/theme';
import { getExercise } from '@/data/exercises';
import type { PlannedSession } from '@/data/types';
import { alpha, mix } from '@/lib/color';
import { tap } from '@/lib/haptics';

/** A soft pool of the region colour behind the hero's move, drifting at breathing pace. */
function BreathingBlob({ color, dark }: { color: string; dark: boolean }) {
  const [breath] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE_DRIVER }),
        Animated.timing(breath, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE_DRIVER }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        {
          transform: [
            { scale: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] }) },
            { translateX: breath.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
          ],
        },
      ]}
    >
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="heroBlob" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity={dark ? 0.55 : 0.75} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={50} cy={50} r={50} fill="url(#heroBlob)" />
      </Svg>
    </Animated.View>
  );
}

type Props = {
  L: LookTokens;
  session: PlannedSession | undefined;
  kicker: string;
  /** Shown minutes (animated by the caller). */
  minutes: number;
  level: number;
  note: string | null;
  /** The check-in answer, shown as a tag that goes back to the question. */
  tag?: { label: string; icon: IconName; onChange: () => void };
  onStart: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
};

/** Today's session: minutes, the first move, the move preview and the start button, in the look's colours. */
export function SessionHero({ L, session, kicker, minutes, level, note, tag, onStart, onLayout }: Props) {
  const moves = session ? [...new Set(session.exerciseIds)] : [];
  const first = session ? getExercise(session.exerciseIds[0]) : undefined;
  const region = REGION_COLORS[first?.area ?? session?.areas[0] ?? 'lowerBack'];

  const content = (
    <>
      {tag ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${tag.label}. Change how you feel`}
          onPress={() => {
            tap();
            tag.onChange();
          }}
          style={[styles.tag, { backgroundColor: alpha('#FFFFFF', L.dark ? 0.08 : 0.7), borderColor: L.chip.border }]}
        >
          <Icon name={tag.icon} size={14} color={L.accent} strokeWidth={2} />
          <T style={[styles.tagText, { color: L.ink }]}>{tag.label}</T>
          <T style={[styles.tagText, { color: L.muted }]}>· change</T>
        </Pressable>
      ) : null}
      <View style={styles.top}>
        <View style={styles.flex}>
          <T variant="kicker" color={L.accent}>
            {kicker}
          </T>
          {session ? (
            <View style={styles.minutes}>
              <T style={[styles.minutesValue, { color: L.ink }]}>{String(minutes)}</T>
              <T style={[styles.minutesUnit, { color: L.muted }]}>min</T>
            </View>
          ) : null}
        </View>
        <PoseBubble pose={first?.pose ?? 'reach'} size={112} color={first ? REGION_COLORS[first.area] : POSE_COLORS[0]} dot={!!session} shadow breathe />
      </View>
      <T variant="h2" color={L.ink} style={styles.title}>
        {session ? session.title : 'Week complete'}
      </T>
      <T variant="small" color={L.muted} style={{ marginTop: 4 }}>
        {session ? `${session.exerciseIds.length} moves · Level ${level}` : 'See you on Monday.'}
      </T>
      {note ? (
        <View style={styles.note}>
          <Icon name="check" size={12} color={L.accent} strokeWidth={2.6} />
          <T variant="caption" color={L.accent}>
            {note}
          </T>
        </View>
      ) : null}

      {session ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow} contentContainerStyle={styles.preview}>
            {moves.map((id, i) => {
              const e = getExercise(id);
              if (!e) return null;
              return (
                <Pressable
                  key={id}
                  accessibilityRole="button"
                  accessibilityLabel={e.name}
                  onPress={() => {
                    tap();
                    router.push({ pathname: '/exercise/[id]', params: { id } });
                  }}
                  style={i > 0 && styles.overlap}
                >
                  <PoseBubble pose={e.pose} size={40} color={REGION_COLORS[e.area]} dot={false} outline />
                </Pressable>
              );
            })}
          </ScrollView>
          {L.start === 'hold' ? (
            <HoldToStart label="Hold to start" onStart={onStart} bg={L.button.bg} text={L.button.text} halo={L.button.halo} style={styles.start} />
          ) : (
            <PrimaryButton label="Start session" icon="play" onPress={onStart} style={styles.start} />
          )}
        </>
      ) : null}
    </>
  );

  let hero: ReactNode;
  if (L.hero === 'card') {
    hero = (
      <Card big style={styles.card}>
        {content}
      </Card>
    );
  } else {
    // The hero takes the colour of today's focus area, with a shadow tinted to match.
    hero = (
      <View style={[styles.shadow, { boxShadow: `0px 26px 46px -28px ${alpha(region, L.dark ? 0.6 : 0.95)}` }]}>
        <View style={[styles.region, { borderColor: L.heroBorder, backgroundColor: L.heroBase }]}>
          <LinearGradient colors={[mix(region, L.heroBase, L.heroTint), L.heroBase]} locations={[0, 0.8]} style={StyleSheet.absoluteFill} />
          <BreathingBlob color={region} dark={L.dark} />
          {content}
        </View>
      </View>
    );
  }
  return (
    <View style={styles.wrap} onLayout={onLayout}>
      {hero}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { marginTop: 8 },
  card: { padding: 22 },
  shadow: { borderRadius: 34 },
  region: { borderRadius: 34, borderWidth: 1, padding: 22, overflow: 'hidden' },
  blob: { position: 'absolute', top: -70, right: -70, width: 280, height: 280 },
  tag: { alignSelf: 'flex-start', marginBottom: 14, height: 30, paddingHorizontal: 11, borderRadius: 15, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  tagText: { fontFamily: fonts.semibold, fontSize: 13 },
  top: { flexDirection: 'row', alignItems: 'flex-start' },
  minutes: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  minutesValue: { fontFamily: fonts.display, fontSize: 64, lineHeight: 68, letterSpacing: -2, fontVariant: ['tabular-nums'] },
  minutesUnit: { fontFamily: fonts.semibold, fontSize: 17 },
  title: { marginTop: 6 },
  note: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  previewRow: { marginTop: 16, marginHorizontal: -22 },
  preview: { paddingHorizontal: 22 },
  overlap: { marginLeft: -8 },
  start: { marginTop: 18 },
});

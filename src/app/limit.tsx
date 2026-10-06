import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { T } from '@/components/T';
import { PrimaryButton, TextButton } from '@/components/ui';
import { config } from '@/constants/config';
import { colors, fonts, NATIVE_DRIVER } from '@/constants/theme';
import { DAY_SHORT, weekdayIndex } from '@/lib/dates';
import { doneThisWeek, thisWeek } from '@/lib/progress';
import { useAppStore } from '@/store/useAppStore';

/** Shown when a free user starts a session after using this week's free ones. */
export default function WeeklyLimit() {
  const plan = useAppStore((s) => s.plan);
  const history = useAppStore((s) => s.history);
  const insets = useSafeAreaInsets();
  const [rise] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(rise, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE_DRIVER }).start();
  }, [rise]);

  const now = new Date();
  // Label each finished session with its planned day (or the day it was done, for one-offs).
  const done = thisWeek(history, now)
    .slice(0, config.freeWeeklySessions)
    .map((h) => plan?.sessions.find((s) => s.id === h.sessionId)?.weekday ?? weekdayIndex(new Date(h.date)))
    .sort((a, b) => a - b)
    .map((weekday) => DAY_SHORT[weekday]);
  const doneIds = doneThisWeek(history, now);
  const nextDay = plan?.sessions.find((s) => !doneIds.has(s.id));

  return (
    <View style={styles.fill}>
      <Pressable accessibilityLabel="Close" style={styles.scrim} onPress={() => router.back()} />
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom, 16) + 18, transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }) }] },
        ]}
      >
        <View style={styles.grabber} />
        <View style={styles.circles}>
          {done.map((day, i) => (
            <View key={`${day}${i}`} style={styles.item}>
              <View style={styles.done}>
                <Icon name="check" size={22} color={colors.white} strokeWidth={3} />
              </View>
              <T style={styles.day}>{day}</T>
            </View>
          ))}
          <View style={styles.item}>
            <View style={styles.locked}>
              <Icon name="lock" size={20} color={colors.ink} strokeWidth={2.2} />
            </View>
            <T style={[styles.day, { color: colors.ink }]}>{nextDay ? DAY_SHORT[nextDay.weekday] : 'NEXT'}</T>
          </View>
        </View>
        <T variant="title" center style={styles.title}>
          {`That's your ${config.freeWeeklySessions} free sessions this week`}
        </T>
        <T variant="body" color={colors.muted} center style={styles.body}>
          Go unlimited, or pick up again on Monday.
        </T>
        <PrimaryButton label="Unlock unlimited sessions" style={styles.cta} onPress={() => router.replace('/premium')} />
        <TextButton label="Not now" onPress={() => router.back()} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 10,
    paddingHorizontal: 24,
    boxShadow: '0px -20px 40px -20px rgba(28,26,22,0.4)',
  },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(90,70,40,0.25)' },
  circles: { marginTop: 30, flexDirection: 'row', justifyContent: 'center', gap: 14 },
  item: { alignItems: 'center', gap: 8 },
  done: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  locked: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(90,70,40,0.35)', alignItems: 'center', justifyContent: 'center' },
  day: { fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8, color: colors.muted },
  title: { marginTop: 26, fontSize: 28, lineHeight: 32 },
  body: { marginTop: 10, alignSelf: 'center', maxWidth: 300 },
  cta: { marginTop: 26 },
});

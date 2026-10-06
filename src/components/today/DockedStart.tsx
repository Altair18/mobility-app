import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HoldToStart } from '@/components/HoldToStart';
import { PoseBubble } from '@/components/PoseBubble';
import { T } from '@/components/T';
import type { LookTokens } from '@/constants/looks';
import { NATIVE_DRIVER, REGION_COLORS } from '@/constants/theme';
import { getExercise } from '@/data/exercises';
import type { PlannedSession } from '@/data/types';

/** Height of the floating tab bar plus its gap, so the dock sits just above it. */
const TAB_BAR = 64 + 4;

type Props = { L: LookTokens; visible: boolean; session: PlannedSession; minutes: number; onStart: () => void };

/** A slim bar above the tab bar once the session card scrolls away, so Start stays in thumb reach. */
export function DockedStart({ L, visible, session, minutes, onStart }: Props) {
  const insets = useSafeAreaInsets();
  const [shown] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.spring(shown, { toValue: visible ? 1 : 0, useNativeDriver: NATIVE_DRIVER, damping: 18, stiffness: 180 }).start();
  }, [visible, shown]);
  const first = getExercise(session.exerciseIds[0]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.wrap,
        { bottom: Math.max(insets.bottom, 12) + TAB_BAR + 10, opacity: shown, transform: [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] },
      ]}
    >
      <View style={[styles.bar, { backgroundColor: L.dark ? 'rgba(22,38,30,0.96)' : 'rgba(255,255,255,0.97)', borderColor: L.chip.border }]}>
        <PoseBubble pose={first?.pose ?? 'reach'} size={38} color={first ? REGION_COLORS[first.area] : REGION_COLORS.lowerBack} dot={false} />
        <View style={styles.text}>
          <T variant="bodyStrong" color={L.ink} numberOfLines={1} style={{ fontSize: 15 }}>
            {session.title}
          </T>
          <T variant="caption" color={L.muted}>{`${minutes} min`}</T>
        </View>
        {L.start === 'hold' ? (
          <HoldToStart label="Hold" onStart={onStart} bg={L.button.bg} text={L.button.text} halo={L.button.halo} compact />
        ) : (
          <HoldToStart label="Start" onStart={onStart} bg={L.button.bg} text={L.button.text} halo="transparent" compact />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  bar: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0px 14px 30px -14px rgba(20,30,20,0.45)',
  },
  text: { flex: 1 },
});

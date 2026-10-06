import { router } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, NATIVE_DRIVER } from '@/constants/theme';
import type { AreaId } from '@/data/types';
import { frameFor } from '@/lib/viewport';

import { BodyFigure } from './BodyFigure';
import { T } from './T';
import { PrimaryButton, TextButton } from './ui';

type SheetProps = { visible: boolean; onClose: () => void; children: ReactNode };

/** Bottom sheet over a dimmed screen. */
export function Sheet({ visible, onClose, children }: SheetProps) {
  const insets = useSafeAreaInsets();
  const [rise] = useState(() => new Animated.Value(0));
  // On a desktop browser the sheet rises inside the phone frame, not across the whole page.
  const frame = frameFor(useWindowDimensions());

  useEffect(() => {
    if (visible) {
      rise.setValue(0);
      Animated.timing(rise, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE_DRIVER }).start();
    }
  }, [visible, rise]);

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.fill, frame && { justifyContent: 'center' }]}>
        <Pressable accessibilityLabel="Close" style={styles.scrim} onPress={onClose} />
        <View pointerEvents="box-none" style={frame ? [styles.framed, { width: frame.width, height: frame.height }] : styles.fill}>
          <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 18, transform: [{ translateY }] }]}>
            <View style={styles.grabber} />
            {children}
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

type PremiumSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  body: string;
  /** Areas to light up on the figure: the new one strongly, current ones softly. */
  highlight?: AreaId;
  current?: AreaId[];
  cta?: string;
};

/** Contextual paywall: shown at the moment someone reaches for a Premium feature. */
export function PremiumSheet({ visible, onClose, title, body, highlight, current = [], cta = 'Unlock Premium' }: PremiumSheetProps) {
  const glows: Partial<Record<AreaId, number>> = {};
  for (const a of current) glows[a] = 0.3;
  if (highlight) glows[highlight] = 1;
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View style={styles.figure}>
        <View style={styles.halo} />
        <BodyFigure height={200} glows={glows} />
      </View>
      <T variant="title" center style={styles.title}>
        {title}
      </T>
      <T variant="body" color={colors.muted} center style={styles.body}>
        {body}
      </T>
      <PrimaryButton
        label={cta}
        style={styles.cta}
        onPress={() => {
          onClose();
          router.push('/premium');
        }}
      />
      <TextButton label="Not now" onPress={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  framed: { alignSelf: 'center', justifyContent: 'flex-end', borderRadius: 44, overflow: 'hidden' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.scrim },
  sheet: {
    backgroundColor: colors.sheet,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 10,
    paddingHorizontal: 24,
    alignItems: 'stretch',
    boxShadow: '0px -20px 40px -20px rgba(28,26,22,0.4)',
  },
  grabber: { alignSelf: 'center', width: 36, height: 5, borderRadius: 3, backgroundColor: 'rgba(90,70,40,0.25)' },
  figure: { alignSelf: 'center', width: 200, height: 200, marginTop: 18, alignItems: 'center' },
  halo: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(47,122,86,0.08)' },
  title: { marginTop: 18, fontSize: 28, lineHeight: 32 },
  body: { marginTop: 10, alignSelf: 'center', maxWidth: 300 },
  cta: { marginTop: 26 },
});

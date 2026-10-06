import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { fonts, MAX_FONT_SCALE, NATIVE_DRIVER } from '@/constants/theme';
import { success, tap } from '@/lib/haptics';

import { Icon } from './Icon';

const HOLD_MS = 900;
const BREATH_MS = 8000;

type Props = {
  label: string;
  onStart: () => void;
  bg: string;
  text: string;
  /** Colour of the soft halo that breathes around the button. */
  halo: string;
  /** Smaller, for the docked bar. */
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Press and hold to begin: a fill sweeps across the button and the session starts when it's full.
 * Letting go early rolls it back. Screen readers start it with a normal activate.
 */
export function HoldToStart({ label, onStart, bg, text, halo, compact, style }: Props) {
  const [fill] = useState(() => new Animated.Value(0));
  const [breath] = useState(() => new Animated.Value(0));
  const [holding, setHolding] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: BREATH_MS / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE_DRIVER }),
        Animated.timing(breath, { toValue: 0, duration: BREATH_MS / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE_DRIVER }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breath]);

  const press = () => {
    tap();
    done.current = false;
    setHolding(true);
    Animated.timing(fill, { toValue: 1, duration: HOLD_MS, easing: Easing.linear, useNativeDriver: false }).start(({ finished }) => {
      if (!finished) return;
      done.current = true;
      success();
      setHolding(false);
      fill.setValue(0);
      onStart();
    });
  };

  const release = () => {
    if (done.current) return;
    setHolding(false);
    Animated.timing(fill, { toValue: 0, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  };

  return (
    <View style={style}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          compact && styles.haloCompact,
          {
            backgroundColor: halo,
            opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.42] }),
            transform: [
              { scaleX: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) },
              { scaleY: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] }) },
            ],
          },
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Press and hold to start"
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'activate') onStart();
        }}
        onPressIn={press}
        onPressOut={release}
        style={[styles.button, compact && styles.buttonCompact, { backgroundColor: bg }]}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.fill, { backgroundColor: text, width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
        />
        <Icon name="play" size={compact ? 12 : 15} color={text} />
        <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.label, compact && styles.labelCompact, { color: text }]}>
          {holding ? (compact ? 'Hold…' : 'Keep holding…') : label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: 'absolute', left: 6, right: 6, top: 4, bottom: 4, borderRadius: 28 },
  button: { height: 56, borderRadius: 28, overflow: 'hidden', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, opacity: 0.16 },
  label: { fontFamily: fonts.semibold, fontSize: 17 },
  haloCompact: { borderRadius: 20 },
  buttonCompact: { height: 40, borderRadius: 20, paddingHorizontal: 16, gap: 7 },
  labelCompact: { fontSize: 14 },
});

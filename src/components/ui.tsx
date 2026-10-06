import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, MAX_FONT_SCALE, SCREEN_PADDING, shadows, TAB_BAR_SPACE } from '@/constants/theme';
import { tap } from '@/lib/haptics';

import { Icon, type IconName } from './Icon';
import { T } from './T';

/** Warm cream-to-sand page background. */
export function Backdrop() {
  return <LinearGradient colors={[colors.bgTop, colors.bgMid, colors.bgBottom]} locations={[0, 0.5, 1]} style={styles.backdrop} />;
}

type ScreenProps = {
  children: ReactNode;
  /** Scrolls, for longer screens. */
  scroll?: boolean;
  /** Leaves room for the floating tab bar. */
  tabBar?: boolean;
  /** Shown as an iOS sheet, which already sits below the status bar. */
  modal?: boolean;
  /** Replaces the cream-to-sand background. */
  backdrop?: ReactNode;
  /** Floats above the content, such as a docked action bar. */
  overlay?: ReactNode;
  /** Scroll position, for scrolling screens. */
  onScroll?: (y: number) => void;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, scroll, tabBar, modal, backdrop, overlay, onScroll, style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: (modal && Platform.OS === 'ios' ? 0 : insets.top) + 12,
    paddingBottom: tabBar ? TAB_BAR_SPACE + insets.bottom : Math.max(insets.bottom, 12) + 12,
    paddingHorizontal: SCREEN_PADDING,
  };
  return (
    <View style={styles.root}>
      {backdrop ?? <Backdrop />}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[padding, style]}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll ? (e) => onScroll(e.nativeEvent.contentOffset.y) : undefined}
          scrollEventThrottle={onScroll ? 32 : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, padding, style]}>{children}</View>
      )}
      {overlay}
    </View>
  );
}

type CardProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Style for the touch area when the card is pressable (use for flex or width). */
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Green outline, for the selected or current item. */
  highlight?: boolean;
  big?: boolean;
};

export function Card({ children, style, containerStyle, onPress, accessibilityLabel, highlight, big }: CardProps) {
  const body = (
    <LinearGradient
      colors={[colors.card, colors.cardEnd]}
      style={[styles.card, big && styles.cardBig, highlight && styles.cardHighlight, style]}
    >
      {children}
    </LinearGradient>
  );
  if (!onPress) return containerStyle ? <View style={containerStyle}>{body}</View> : body;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ label, onPress, disabled, icon, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [styles.primary, disabled ? styles.primaryDisabled : styles.primaryShadow, pressed && styles.pressed, style]}
    >
      {icon ? <Icon name={icon} size={16} color={disabled ? 'rgba(28,26,22,0.45)' : colors.cream} strokeWidth={2.4} /> : null}
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.primaryLabel, disabled && styles.primaryLabelDisabled]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, icon, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [styles.secondary, pressed && styles.pressed, style]}
    >
      {icon ? <Icon name={icon} size={18} color={colors.ink} /> : null}
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={styles.secondaryLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TextButton({ label, onPress, color = colors.muted, style }: ButtonProps & { color?: string }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.textButton, pressed && { opacity: 0.6 }, style]}>
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.textButtonLabel, { color }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** The sand "Start" pill used inside session cards. */
export function SandPill({ label = 'Start', small }: { label?: string; small?: boolean }) {
  return (
    <LinearGradient colors={[colors.sandTop, colors.sandBottom]} style={[styles.sand, small ? styles.sandSmall : styles.sandShadow]}>
      <Icon name="play" size={small ? 11 : 13} color={colors.ink} />
      {small ? null : (
        <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={styles.sandLabel}>
          {label}
        </Text>
      )}
    </LinearGradient>
  );
}

export function IconButton({ icon, onPress, label, style }: { icon: IconName; onPress: () => void; label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed, style]}
    >
      <Icon name={icon} size={icon === 'back' ? 22 : 18} color={colors.ink} strokeWidth={2.2} />
    </Pressable>
  );
}

export function Chip({ label, tone = 'plain', icon }: { label: string; tone?: 'plain' | 'green'; icon?: IconName }) {
  return (
    <View style={[styles.chip, tone === 'green' && styles.chipGreen]}>
      {icon ? <Icon name={icon} size={15} color={tone === 'green' ? colors.greenDeep : colors.muted} strokeWidth={1.9} /> : null}
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.chipLabel, tone === 'green' && { color: colors.greenDeep }]}>
        {label}
      </Text>
    </View>
  );
}

type OptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  /** Large numerals, for the days and minutes pickers. */
  display?: boolean;
  accessibilityLabel?: string;
  icon?: IconName;
};

export function OptionPill({ label, selected, onPress, style, display, accessibilityLabel, icon }: OptionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.option, icon && styles.optionWithIcon, selected && styles.optionOn, pressed && styles.pressed, style]}
    >
      {icon ? <Icon name={icon} size={17} color={selected ? colors.white : colors.green} strokeWidth={1.9} active={selected} /> : null}
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[display ? styles.optionDisplay : styles.optionLabel, selected && { color: colors.white }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Segments({ count, filled, active }: { count: number; filled: number; active?: number }) {
  return (
    <View style={styles.segments}>
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={[styles.segment, { backgroundColor: i < filled ? colors.green : i === active ? 'rgba(47,122,86,0.45)' : colors.line }]}
        />
      ))}
    </View>
  );
}

export function Stat({ value, label, divider, center }: { value: string; label: string; divider?: boolean; center?: boolean }) {
  return (
    <View style={[styles.stat, divider && styles.statDivider, center && styles.statCenter]}>
      <T variant="stat" center={center}>
        {value}
      </T>
      <T variant="caption" center={center} style={{ marginTop: 2 }}>
        {label}
      </T>
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgTop },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' },
  fill: { flex: 1 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.94 },
  card: { borderRadius: 24, borderWidth: 1, borderColor: colors.border, boxShadow: shadows.small },
  cardBig: { borderRadius: 34, boxShadow: shadows.card },
  cardHighlight: { borderWidth: 2, borderColor: colors.green },
  primary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryShadow: { boxShadow: shadows.button },
  primaryDisabled: { backgroundColor: 'rgba(28,26,22,0.14)' },
  primaryLabel: { fontFamily: fonts.semibold, fontSize: 17, color: colors.cream },
  primaryLabelDisabled: { color: 'rgba(28,26,22,0.45)' },
  secondary: {
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,253,249,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(90,70,40,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondaryLabel: { fontFamily: fonts.semibold, fontSize: 17, color: colors.ink },
  textButton: { height: 44, alignItems: 'center', justifyContent: 'center' },
  textButtonLabel: { fontFamily: fonts.semibold, fontSize: 15 },
  sand: {
    height: 48,
    paddingHorizontal: 26,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(90,70,40,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  sandShadow: { boxShadow: '0px 6px 14px -6px rgba(70,50,20,0.4)' },
  sandSmall: { width: 34, height: 34, paddingHorizontal: 0, borderRadius: 17 },
  sandLabel: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,253,249,0.7)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,253,249,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(90,70,40,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipGreen: { backgroundColor: 'rgba(47,122,86,0.10)', borderColor: 'transparent' },
  chipLabel: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  option: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(90,70,40,0.16)',
    backgroundColor: 'rgba(255,253,249,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionWithIcon: { flexDirection: 'row', gap: 7 },
  optionOn: { backgroundColor: colors.green, borderColor: colors.green, boxShadow: shadows.green },
  optionLabel: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  optionDisplay: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  segments: { flexDirection: 'row', gap: 6, flex: 1 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  stat: { flex: 1 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: colors.line, paddingLeft: 18 },
  statCenter: { alignItems: 'center', paddingLeft: 0 },
  divider: { height: 1, backgroundColor: 'rgba(90,70,40,0.14)' },
});

import { Pressable, StyleSheet, Text } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import type { LookTokens } from '@/constants/looks';
import { fonts, MAX_FONT_SCALE } from '@/constants/theme';
import { tap } from '@/lib/haptics';

type Props = { L: LookTokens; label: string; icon?: IconName; selected: boolean; onPress: () => void; small?: boolean };

/** A pill in the look's colours, for the check-in and the prototype switchers. */
export function LookChip({ L, label, icon, selected, onPress, small }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        small && styles.small,
        { backgroundColor: selected ? L.chip.onBg : L.chip.bg, borderColor: selected ? L.chip.onBg : L.chip.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      {icon ? <Icon name={icon} size={17} color={selected ? L.chip.onText : L.chip.icon} strokeWidth={1.9} active={selected} /> : null}
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[small ? styles.smallLabel : styles.label, { color: selected ? L.chip.onText : L.chip.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: 38, paddingHorizontal: 15, borderRadius: 19, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  small: { minHeight: 28, paddingHorizontal: 10, borderRadius: 14 },
  label: { fontFamily: fonts.semibold, fontSize: 15 },
  smallLabel: { fontFamily: fonts.semibold, fontSize: 12 },
});

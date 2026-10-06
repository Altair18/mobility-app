import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { T } from '@/components/T';
import type { LookTokens } from '@/constants/looks';
import { fonts } from '@/constants/theme';
import { alpha } from '@/lib/color';
import { tap } from '@/lib/haptics';

export type Answer = 'good' | 'stiff' | 'sore' | 'short';

export const ANSWERS: { key: Answer; label: string; hint: string; icon: IconName }[] = [
  { key: 'good', label: 'Feeling good', hint: 'Today’s plan as is', icon: 'sun' },
  { key: 'stiff', label: 'Stiff somewhere', hint: 'Pick the spot', icon: 'target' },
  { key: 'sore', label: 'A bit sore', hint: 'Gentler moves', icon: 'feather' },
  { key: 'short', label: 'Short on time', hint: 'A 5-minute version', icon: 'clock' },
];

/** The first stage of the day: the check-in is the whole page, with four large answers. */
export function AskStage({ L, onAnswer, onSkip }: { L: LookTokens; onAnswer: (a: Answer) => void; onSkip: () => void }) {
  return (
    <View style={styles.wrap}>
      <T style={[styles.question, { color: L.ink }]}>How&apos;s your body today?</T>
      <T variant="small" color={L.muted} style={styles.sub}>
        Today&apos;s session shapes itself around your answer.
      </T>
      <View style={styles.grid}>
        {ANSWERS.map((a) => (
          <Pressable
            key={a.key}
            accessibilityRole="button"
            accessibilityLabel={`${a.label}. ${a.hint}`}
            onPress={() => {
              tap();
              onAnswer(a.key);
            }}
            style={({ pressed }) => [styles.tile, { backgroundColor: L.chip.bg, borderColor: L.chip.border }, pressed && styles.pressed]}
          >
            <View style={[styles.iconWrap, { backgroundColor: alpha(L.dark ? '#A6F2C8' : '#2F7A56', L.dark ? 0.12 : 0.1) }]}>
              <Icon name={a.icon} size={24} color={L.accent} strokeWidth={1.8} />
            </View>
            <View>
              <T variant="bodyStrong" color={L.ink}>
                {a.label}
              </T>
              <T variant="caption" color={L.muted} style={{ marginTop: 2 }}>
                {a.hint}
              </T>
            </View>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          tap();
          onSkip();
        }}
        hitSlop={10}
        style={styles.skip}
      >
        <T variant="smallStrong" color={L.muted}>
          Skip to today&apos;s plan
        </T>
        <Icon name="chevron" size={14} color={L.muted} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 26 },
  question: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.6 },
  sub: { marginTop: 8 },
  grid: { marginTop: 22, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  tile: { width: '48.2%', height: 132, borderRadius: 26, borderWidth: 1, padding: 16, justifyContent: 'space-between' },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  skip: { marginTop: 18, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 4 },
});

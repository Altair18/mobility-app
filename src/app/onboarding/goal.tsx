import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { OnboardingHeader } from '@/components/OnboardingHeader';
import { T } from '@/components/T';
import { OptionPill, PrimaryButton, Screen } from '@/components/ui';
import { colors, shadows } from '@/constants/theme';
import { GOALS, LEVELS } from '@/data/content';
import { tap } from '@/lib/haptics';
import { useAppStore } from '@/store/useAppStore';

export default function GoalAndExperience() {
  const goal = useAppStore((s) => s.draft.goal);
  const level = useAppStore((s) => s.draft.level);
  const setDraft = useAppStore((s) => s.setDraft);

  return (
    <Screen>
      <OnboardingHeader step={2} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <T variant="title">What&apos;s your main goal?</T>
        <View style={styles.pills}>
          {GOALS.map((g) => (
            <OptionPill key={g.id} label={g.label} selected={goal === g.id} onPress={() => setDraft({ goal: g.id })} />
          ))}
        </View>

        <T variant="h2" style={styles.h2}>
          Your experience
        </T>
        <View style={styles.levels}>
          {LEVELS.map((l) => {
            const on = level === l.id;
            return (
              <Pressable
                key={l.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  tap();
                  setDraft({ level: l.id });
                }}
                style={({ pressed }) => [styles.level, on && styles.levelOn, pressed && { opacity: 0.9 }]}
              >
                <View style={styles.bars}>
                  {[8, 13, 18].map((h, i) => (
                    <View key={h} style={[styles.bar, { height: h, backgroundColor: i < l.id ? colors.green : 'rgba(90,70,40,0.18)' }]} />
                  ))}
                </View>
                <T variant="bodyStrong" style={styles.levelLabel}>
                  {l.label}
                </T>
                {on ? (
                  <View style={styles.radioOn}>
                    <Icon name="check" size={14} color={colors.white} strokeWidth={3} />
                  </View>
                ) : (
                  <View style={styles.radioOff} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <PrimaryButton label="Continue" style={styles.cta} onPress={() => router.push('/onboarding/days')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 20, paddingBottom: 12 },
  pills: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  h2: { marginTop: 44 },
  levels: { marginTop: 16, gap: 10 },
  level: {
    height: 64,
    borderRadius: 20,
    paddingLeft: 18,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFBF4',
    borderWidth: 1,
    borderColor: 'rgba(90,70,40,0.14)',
  },
  levelOn: { borderWidth: 2, borderColor: colors.green, boxShadow: shadows.small },
  bars: { width: 18, height: 18, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 4, borderRadius: 2 },
  levelLabel: { flex: 1 },
  radioOn: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  radioOff: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(90,70,40,0.25)' },
  cta: { marginTop: 12 },
});

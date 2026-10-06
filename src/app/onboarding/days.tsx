import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingHeader } from '@/components/OnboardingHeader';
import { T } from '@/components/T';
import { OptionPill, PrimaryButton, Screen } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { DAY_OPTIONS, DAY_PATTERNS } from '@/data/content';
import type { DaysPerWeek } from '@/data/types';
import { DAY_LETTER } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';

export default function Days() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = edit === '1';
  const draftDays = useAppStore((s) => s.draft.days);
  const planDays = useAppStore((s) => s.plan?.days);
  const setDraft = useAppStore((s) => s.setDraft);
  const updatePlan = useAppStore((s) => s.updatePlan);
  const [days, setDays] = useState<DaysPerWeek>(editing && planDays ? planDays : draftDays);
  const pattern = DAY_PATTERNS[days];
  const choose = (n: DaysPerWeek) => {
    setDays(n);
    if (!editing) setDraft({ days: n });
  };

  return (
    <Screen>
      <OnboardingHeader step={editing ? undefined : 3} />
      <T variant="title" style={styles.title}>
        How many days a week?
      </T>
      <T variant="body" color={colors.muted} style={styles.sub}>
        This becomes your weekly target.
      </T>
      <View style={styles.stage}>
        <T style={styles.numeral}>{String(days)}</T>
        <T variant="body" color={colors.muted} style={styles.unit}>
          {days === 7 ? 'every day' : 'days a week'}
        </T>
        <View style={styles.week}>
          {DAY_LETTER.map((letter, i) => {
            const on = pattern.includes(i);
            return (
              <View key={i} style={[styles.day, on && styles.dayOn]}>
                <T style={[styles.dayLetter, { color: on ? colors.white : colors.muted }]}>{letter}</T>
              </View>
            );
          })}
        </View>
      </View>
      <View style={styles.options}>
        {DAY_OPTIONS.map((n) => (
          <OptionPill
            key={n}
            display
            label={String(n)}
            accessibilityLabel={n === 7 ? 'Every day' : `${n} days a week`}
            selected={days === n}
            onPress={() => choose(n)}
            style={styles.option}
          />
        ))}
      </View>
      <PrimaryButton
        label={editing ? 'Save' : 'Continue'}
        style={styles.cta}
        onPress={() => {
          if (editing) {
            updatePlan({ days });
            router.back();
          } else {
            router.push('/onboarding/length');
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 20 },
  sub: { marginTop: 8 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  numeral: { fontFamily: fonts.display, fontSize: 136, lineHeight: 140, letterSpacing: -4, color: colors.ink },
  unit: { marginTop: 4, fontSize: 17 },
  week: { marginTop: 32, flexDirection: 'row', gap: 8 },
  day: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(90,70,40,0.08)', alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.green },
  dayLetter: { fontFamily: fonts.bold, fontSize: 13 },
  options: { flexDirection: 'row', justifyContent: 'space-between' },
  option: { width: 60, height: 60, borderRadius: 30, paddingHorizontal: 0 },
  cta: { marginTop: 24 },
});

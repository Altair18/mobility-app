import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingHeader } from '@/components/OnboardingHeader';
import { Ring } from '@/components/Ring';
import { T } from '@/components/T';
import { OptionPill, PrimaryButton, Screen } from '@/components/ui';
import { colors, fonts, shadows } from '@/constants/theme';
import { MINUTE_OPTIONS } from '@/data/content';
import type { Minutes } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';

export default function Length() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = edit === '1';
  const draftMinutes = useAppStore((s) => s.draft.minutes);
  const planMinutes = useAppStore((s) => s.plan?.minutes);
  const setDraft = useAppStore((s) => s.setDraft);
  const [minutes, setMinutes] = useState<Minutes>(editing && planMinutes ? planMinutes : draftMinutes);
  const choose = (m: Minutes) => {
    setMinutes(m);
    if (!editing) setDraft({ minutes: m });
  };
  const createPlan = useAppStore((s) => s.createPlan);
  const updatePlan = useAppStore((s) => s.updatePlan);

  return (
    <Screen>
      <OnboardingHeader step={editing ? undefined : 4} />
      <T variant="title" style={styles.title}>
        How long per session?
      </T>
      <T variant="body" color={colors.muted} style={styles.sub}>
        Ten minutes a day adds up quickly.
      </T>
      <View style={styles.stage}>
        <View style={styles.dial}>
          <View style={styles.face} />
          <Ring size={240} stroke={8} progress={minutes / 20}>
            <T style={styles.numeral}>{String(minutes)}</T>
            <T variant="body" color={colors.muted}>
              minutes
            </T>
          </Ring>
        </View>
      </View>
      <View style={styles.options}>
        {MINUTE_OPTIONS.map((m) => (
          <OptionPill key={m} label={`${m} min`} selected={minutes === m} onPress={() => choose(m)} style={styles.option} />
        ))}
      </View>
      <PrimaryButton
        label={editing ? 'Save' : 'Build my plan'}
        style={styles.cta}
        onPress={() => {
          if (editing) {
            updatePlan({ minutes });
            router.back();
          } else {
            createPlan();
            router.push('/onboarding/building');
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: 8 },
  title: { marginTop: 20 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dial: { width: 240, height: 240 },
  face: {
    position: 'absolute',
    left: 20,
    top: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFFBF4',
    boxShadow: shadows.card,
  },
  numeral: { fontFamily: fonts.display, fontSize: 88, lineHeight: 92, letterSpacing: -3, color: colors.ink },
  options: { flexDirection: 'row', justifyContent: 'space-between' },
  option: { width: 76, height: 52, borderRadius: 26, paddingHorizontal: 0 },
  cta: { marginTop: 24 },
});

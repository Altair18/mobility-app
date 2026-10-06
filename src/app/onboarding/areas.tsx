import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BodyMap, ViewToggle } from '@/components/BodyFigure';
import { OnboardingHeader } from '@/components/OnboardingHeader';
import { T } from '@/components/T';
import { PrimaryButton, Screen } from '@/components/ui';
import { colors } from '@/constants/theme';
import { selectionLabel } from '@/data/areas';
import type { AreaId, BodyView } from '@/data/types';
import { useViewport } from '@/lib/viewport';
import { useAppStore } from '@/store/useAppStore';

export default function Areas() {
  const selected = useAppStore((s) => s.draft.areas);
  const setDraft = useAppStore((s) => s.setDraft);
  const [view, setView] = useState<BodyView>('back');
  const { height } = useViewport();
  const mapHeight = Math.max(240, Math.min(460, height - 440));

  const toggle = (area: AreaId) =>
    setDraft({ areas: selected.includes(area) ? selected.filter((a) => a !== area) : [...selected, area] });

  return (
    <Screen>
      <OnboardingHeader step={1} />
      <T variant="title" style={styles.title}>
        Where would you like to move better?
      </T>
      <T variant="body" color={colors.muted} style={styles.sub}>
        Choose every area that feels stiff or tight. You can change this later.
      </T>
      <View style={styles.toggle}>
        <ViewToggle view={view} onChange={setView} />
      </View>
      <View style={styles.stage}>
        <BodyMap view={view} selected={selected} onToggle={toggle} height={mapHeight} />
      </View>
      <View style={styles.labelBox}>
        <T variant="smallStrong" center numberOfLines={2} color={selected.length ? colors.greenText : colors.muted} style={styles.label}>
          {selectionLabel(selected)}
        </T>
      </View>
      <PrimaryButton label="Continue" disabled={selected.length === 0} style={styles.cta} onPress={() => router.push('/onboarding/goal')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: 20 },
  sub: { marginTop: 8 },
  toggle: { marginTop: 18 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  labelBox: { height: 44, justifyContent: 'center', paddingHorizontal: 12 },
  label: { fontSize: 14, lineHeight: 20 },
  cta: { marginTop: 16 },
});

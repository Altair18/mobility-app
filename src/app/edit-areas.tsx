import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BodyMap, ViewToggle } from '@/components/BodyFigure';
import { PremiumSheet } from '@/components/Sheet';
import { T } from '@/components/T';
import { IconButton, PrimaryButton, Screen } from '@/components/ui';
import { colors } from '@/constants/theme';
import { AREA_NAMES, selectionLabel, sortAreas } from '@/data/areas';
import type { AreaId, BodyView } from '@/data/types';
import { useViewport } from '@/lib/viewport';
import { useAppStore } from '@/store/useAppStore';

export default function EditAreas() {
  const plan = useAppStore((s) => s.plan);
  const isPremium = useAppStore((s) => s.isPremium);
  const updatePlan = useAppStore((s) => s.updatePlan);
  const [view, setView] = useState<BodyView>('back');
  const [selected, setSelected] = useState<AreaId[]>(plan?.areas ?? []);
  const [sheet, setSheet] = useState<{ area: AreaId; adding: boolean } | null>(null);
  const { height } = useViewport();
  const mapHeight = Math.max(240, Math.min(460, height - 390));
  if (!plan) return null;

  const changed = sortAreas(selected).join() !== sortAreas(plan.areas).join();

  const toggle = (area: AreaId) => {
    const adding = !selected.includes(area);
    // Changing areas after onboarding is Premium: free users see why at the moment they try.
    if (!isPremium) {
      setSheet({ area, adding });
      return;
    }
    setSelected(adding ? [...selected, area] : selected.filter((a) => a !== area));
  };

  return (
    <Screen modal>
      <View style={styles.header}>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
        <T variant="bodyStrong" center style={styles.flex}>
          Your areas
        </T>
        <View style={{ width: 44 }} />
      </View>
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
      {isPremium ? (
        <PrimaryButton
          label="Save"
          disabled={!changed || selected.length === 0}
          style={styles.cta}
          onPress={() => {
            updatePlan({ areas: selected });
            router.back();
          }}
        />
      ) : (
        <T variant="caption" center style={styles.cta}>
          Tap an area to add it to your plan.
        </T>
      )}
      <PremiumSheet
        visible={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet ? (sheet.adding ? `Add ${AREA_NAMES[sheet.area].toLowerCase()} to your plan?` : 'Change your areas?') : ''}
        body="Premium adjusts your plan whenever your goals change."
        highlight={sheet?.adding ? sheet.area : undefined}
        current={plan.areas}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggle: { marginTop: 18 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  labelBox: { height: 44, justifyContent: 'center', paddingHorizontal: 12 },
  label: { fontSize: 14, lineHeight: 20 },
  cta: { marginTop: 16 },
});

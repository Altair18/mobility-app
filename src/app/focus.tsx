import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BodyMap, ViewToggle } from '@/components/BodyFigure';
import { PremiumSheet } from '@/components/Sheet';
import { T } from '@/components/T';
import { IconButton, PrimaryButton, Screen } from '@/components/ui';
import { colors } from '@/constants/theme';
import { AREA_NAMES, FOCUS_TITLES } from '@/data/areas';
import type { AreaId, BodyView } from '@/data/types';
import { useViewport } from '@/lib/viewport';
import { useAppStore } from '@/store/useAppStore';

/** "Where are you stiff today?" — a one-off session for one area (Premium). */
export default function Focus() {
  const plan = useAppStore((s) => s.plan);
  const isPremium = useAppStore((s) => s.isPremium);
  const startQuick = useAppStore((s) => s.startQuick);
  const [view, setView] = useState<BodyView>('back');
  const [area, setArea] = useState<AreaId | null>(null);
  const [sheet, setSheet] = useState(false);
  const { height } = useViewport();
  const mapHeight = Math.max(240, Math.min(450, height - 410));
  if (!plan) return null;

  const pick = (a: AreaId) => {
    setArea(a);
    if (!isPremium) setSheet(true);
  };

  const start = () => {
    if (!area) return;
    const session = startQuick(area);
    if (session) router.replace({ pathname: '/session', params: { id: session.id } });
  };

  return (
    <Screen modal>
      <View style={styles.header}>
        <IconButton icon="close" label="Close" onPress={() => router.back()} />
      </View>
      <T variant="title" style={styles.title}>
        Where are you stiff today?
      </T>
      <T variant="body" color={colors.muted} style={styles.sub}>
        Pick one area for today&apos;s session.
      </T>
      <View style={styles.toggle}>
        <ViewToggle view={view} onChange={setView} />
      </View>
      <View style={styles.stage}>
        <BodyMap view={view} selected={area ? [area] : []} onToggle={pick} height={mapHeight} />
      </View>
      <PrimaryButton
        label={area ? `Start ${FOCUS_TITLES[area].toLowerCase()} · ${plan.minutes} min` : 'Pick an area'}
        icon={area ? 'play' : undefined}
        disabled={!area}
        onPress={() => (isPremium ? start() : setSheet(true))}
      />
      <PremiumSheet
        visible={sheet}
        onClose={() => setSheet(false)}
        title={area ? `Focus on ${AREA_NAMES[area].toLowerCase()} today?` : 'Adjust today’s session'}
        body="Premium adjusts today’s session to how you feel."
        highlight={area ?? undefined}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { height: 44 },
  title: { marginTop: 16 },
  sub: { marginTop: 8 },
  toggle: { marginTop: 18 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

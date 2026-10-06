import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AreaGlyph } from '@/components/AreaIcon';
import { Icon } from '@/components/Icon';
import { PoseBubble } from '@/components/PoseBubble';
import { T } from '@/components/T';
import { Card, IconButton, Screen, Segments } from '@/components/ui';
import { colors, REGION_COLORS } from '@/constants/theme';
import { AREA_NAMES, AREA_ORDER } from '@/data/areas';
import { LEVEL_NAME } from '@/data/content';
import { durationLabel, exercisesForArea } from '@/data/exercises';
import type { AreaId } from '@/data/types';
import { useAppStore } from '@/store/useAppStore';

export default function AreaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = useAppStore((s) => s.plan);
  const areaLevels = useAppStore((s) => s.areaLevels);
  const isPremium = useAppStore((s) => s.isPremium);
  const area = AREA_ORDER.find((a) => a === id) as AreaId | undefined;
  if (!area || !plan) return <Redirect href="/" />;

  const level = areaLevels[area] ?? plan.level;
  const moves = exercisesForArea(area);

  return (
    <Screen scroll>
      <IconButton icon="back" label="Back" onPress={() => router.back()} />
      <View style={styles.head}>
        <View style={styles.icon}>
          <AreaGlyph area={area} size={58} />
        </View>
        <View style={styles.flex}>
          <T variant="title">{AREA_NAMES[area]}</T>
          <T variant="small" style={{ marginTop: 4 }}>{`Level ${level} of 3 · ${LEVEL_NAME[level]}`}</T>
          <View style={styles.level}>
            <Segments count={3} filled={level} />
          </View>
        </View>
      </View>

      <T variant="kicker" style={styles.section}>
        Moves
      </T>
      <View style={styles.list}>
        {moves.map((e, i) => {
          const locked = e.level > level && !isPremium;
          return (
            <Card
              key={e.id}
              style={styles.row}
              onPress={() => (locked ? router.push('/premium') : router.push({ pathname: '/exercise/[id]', params: { id: e.id } }))}
              accessibilityLabel={locked ? `${e.name}, Premium` : e.name}
            >
              <PoseBubble move={e.id} pose={e.pose} size={44} color={REGION_COLORS[e.area]} dot={false} style={locked ? styles.dim : undefined} />
              <View style={styles.flex}>
                <T variant="bodyStrong" color={locked ? colors.muted : colors.ink}>
                  {e.name}
                </T>
                <T variant="caption" style={{ marginTop: 2 }}>{`${LEVEL_NAME[e.level]} · ${durationLabel(e)}`}</T>
              </View>
              <Icon name={locked ? 'lock' : 'chevron'} size={16} color={locked ? colors.muted : colors.chevron} strokeWidth={2.2} />
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 18 },
  icon: { width: 104, height: 104, borderRadius: 52, borderWidth: 1.5, borderColor: colors.green, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(255,253,249,0.6)' },
  level: { marginTop: 12, flexDirection: 'row', width: 120 },
  section: { marginTop: 28 },
  list: { marginTop: 12, gap: 10 },
  row: { height: 68, borderRadius: 20, paddingHorizontal: 12, paddingRight: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dim: { opacity: 0.55 },
});

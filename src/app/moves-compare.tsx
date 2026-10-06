// Side-by-side of the previous and new move drawings, for the team to compare. Delete with PoseBubbleClassic once chosen.
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PoseBubble } from '@/components/PoseBubble';
import { PoseBubbleClassic } from '@/components/PoseBubbleClassic';
import { T } from '@/components/T';
import { OptionPill, Screen } from '@/components/ui';
import { colors, POSE_COLORS, REGION_COLORS } from '@/constants/theme';
import { AREA_NAMES } from '@/data/areas';
import { EXERCISES } from '@/data/exercises';
import { MOTION } from '@/data/poses';
import type { AreaId, PoseKey } from '@/data/types';

/** One move per pose, so every drawing appears once. */
const SAMPLES = EXERCISES.filter((e, i, all) => all.findIndex((x) => x.pose === e.pose) === i);
const ANIMATED = Object.keys(MOTION) as PoseKey[];
const REGIONS: [string, AreaId][] = [
  ['Neck & shoulders', 'neck'],
  ['Elbows & wrists', 'wrists'],
  ['Back', 'lowerBack'],
  ['Hips', 'hips'],
  ['Knees, ankles & feet', 'knees'],
];

export default function MovesCompare() {
  const [playing, setPlaying] = useState(true);
  return (
    <Screen scroll>
      <T variant="title">Move drawings</T>
      <T variant="small" style={styles.sub}>
        Previous style on the left of each pair, new style on the right.
      </T>

      <View style={styles.headRow}>
        <T variant="kicker">Moving</T>
        <OptionPill label={playing ? 'Pause' : 'Play'} selected={playing} onPress={() => setPlaying((p) => !p)} style={styles.toggle} />
      </View>
      <View style={styles.grid}>
        {ANIMATED.map((pose) => {
          const e = EXERCISES.find((x) => x.pose === pose);
          return (
            <View key={pose} style={styles.cell}>
              <PoseBubble pose={pose} size={96} color={e ? REGION_COLORS[e.area] : POSE_COLORS[0]} breathe={playing} shadow />
              <T variant="caption" center numberOfLines={1} style={styles.name}>
                {e?.name ?? pose}
              </T>
            </View>
          );
        })}
      </View>

      <T variant="kicker" style={styles.section}>
        Colour by region
      </T>
      <View style={styles.legend}>
        {REGIONS.map(([label, area]) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: REGION_COLORS[area] }]} />
            <T variant="caption">{label}</T>
          </View>
        ))}
      </View>

      <T variant="kicker" style={styles.section}>
        Every move · before / after
      </T>
      <View style={styles.pairs}>
        {SAMPLES.map((e, i) => (
          <View key={e.id} style={styles.pair}>
            <View style={styles.pairRow}>
              <PoseBubbleClassic pose={e.pose} size={64} color={POSE_COLORS[i % POSE_COLORS.length]} />
              <PoseBubble pose={e.pose} size={64} color={REGION_COLORS[e.area]} />
            </View>
            <T variant="caption" center numberOfLines={1} style={styles.name}>
              {`${e.name} · ${AREA_NAMES[e.area]}`}
            </T>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sub: { marginTop: 6 },
  headRow: { marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggle: { minHeight: 34, paddingHorizontal: 14 },
  grid: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  cell: { width: '31%', alignItems: 'center' },
  name: { marginTop: 6, color: colors.muted },
  section: { marginTop: 28 },
  legend: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 14, height: 14, borderRadius: 7 },
  pairs: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18 },
  pair: { width: '48%', alignItems: 'center' },
  pairRow: { flexDirection: 'row', gap: 8 },
});

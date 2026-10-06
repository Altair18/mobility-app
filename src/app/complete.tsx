import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BodyFigure } from '@/components/BodyFigure';
import { Icon, type IconName } from '@/components/Icon';
import { T } from '@/components/T';
import { Divider, IconButton, OptionPill, PrimaryButton, Screen, Stat } from '@/components/ui';
import { colors } from '@/constants/theme';
import type { AreaId, Feedback } from '@/data/types';
import { continueFirstRun } from '@/lib/flow';
import { sessionMinutes, thisWeek } from '@/lib/progress';
import { useViewport } from '@/lib/viewport';
import { useAppStore } from '@/store/useAppStore';

const FEELINGS: { id: Feedback; label: string; icon: IconName }[] = [
  { id: 'easy', label: 'Too easy', icon: 'level1' },
  { id: 'right', label: 'Just right', icon: 'level2' },
  { id: 'hard', label: 'Too hard', icon: 'level3' },
];

export default function Complete() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const record = useAppStore((s) => s.history.find((h) => h.id === id));
  const history = useAppStore((s) => s.history);
  const plan = useAppStore((s) => s.plan);
  const isPremium = useAppStore((s) => s.isPremium);
  const setFeedback = useAppStore((s) => s.setFeedback);
  const compact = useViewport().height < 760;

  if (!record || !plan) return <Redirect href="/" />;

  // The figure is 240 tall normally, smaller on short phones; the tick badge sits on the hip.
  const figureHeight = compact ? 184 : 240;
  const figureLeft = (220 - figureHeight / 2) / 2;
  const badge = { left: figureLeft + figureHeight * 0.4 - 2, top: figureHeight * 0.625 };

  const weekCount = thisWeek(history, new Date()).length;
  const minutes = sessionMinutes(record);
  const glows = Object.fromEntries(record.areas.map((a) => [a, 0.95])) as Partial<Record<AreaId, number>>;
  const adjusting = record.feedback === 'easy' || record.feedback === 'hard';

  return (
    <Screen>
      <View style={styles.top}>
        <IconButton icon="share" label="Share your week" onPress={() => router.push('/share')} />
      </View>
      <View style={[styles.figure, { height: figureHeight }]}>
        <View style={[styles.halo, compact && styles.haloCompact]} />
        <BodyFigure height={figureHeight} glows={glows} />
        <View style={[styles.badge, badge]}>
          <Icon name="check" size={20} color={colors.white} strokeWidth={3} />
        </View>
      </View>
      <T variant="title" center style={[styles.title, compact && { marginTop: 12 }]}>
        Session complete
      </T>
      <T variant="body" color={colors.muted} center style={styles.sub}>
        {record.title}
      </T>
      <View style={[styles.stats, compact && { marginTop: 16 }]}>
        <Stat value={String(minutes)} label={minutes === 1 ? 'minute' : 'minutes'} center />
        <Stat value={String(record.moves)} label={record.moves === 1 ? 'move' : 'moves'} divider center />
        <Stat value={`${weekCount}/${plan.days}`} label="this week" divider center />
      </View>
      <View style={[styles.divider, compact && { marginTop: 18 }]}>
        <Divider />
      </View>
      <T variant="bodyStrong" center style={styles.question}>
        How did that feel?
      </T>
      <View style={styles.feel}>
        {FEELINGS.map((f) => (
          <OptionPill key={f.id} label={f.label} icon={f.icon} selected={record.feedback === f.id} onPress={() => setFeedback(record.id, f.id)} style={styles.feelOption} />
        ))}
      </View>
      {adjusting ? (
        <T variant="caption" center style={styles.note}>
          {isPremium
            ? record.feedback === 'easy'
              ? 'Next time steps up a level.'
              : 'Next time eases off a level.'
            : 'Premium adjusts your plan to this.'}
        </T>
      ) : null}
      <View style={styles.flex} />
      <PrimaryButton label="Continue" onPress={() => continueFirstRun('complete')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { height: 44, alignItems: 'flex-end' },
  figure: { alignSelf: 'center', width: 220, alignItems: 'center', marginTop: 4 },
  halo: { position: 'absolute', left: 10, top: 20, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(47,122,86,0.10)' },
  haloCompact: { left: 30, top: 12, width: 160, height: 160, borderRadius: 80 },
  badge: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.green,
    borderWidth: 3,
    borderColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 18, fontSize: 34, lineHeight: 38 },
  sub: { marginTop: 6 },
  stats: { marginTop: 24, flexDirection: 'row' },
  divider: { marginTop: 26 },
  question: { marginTop: 22, fontSize: 17 },
  feel: { marginTop: 14, flexDirection: 'row', gap: 8 },
  feelOption: { flex: 1, height: 52, borderRadius: 26, paddingHorizontal: 4, gap: 5 },
  note: { marginTop: 10 },
  flex: { flex: 1 },
});

import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BodyFigure } from '@/components/BodyFigure';
import { Icon } from '@/components/Icon';
import { PoseBubble } from '@/components/PoseBubble';
import { Ring } from '@/components/Ring';
import { T } from '@/components/T';
import { Card, IconButton, Screen } from '@/components/ui';
import { colors, fonts, POSE_COLORS, REGION_COLORS } from '@/constants/theme';
import { AREA_NAMES } from '@/data/areas';
import type { AreaId } from '@/data/types';
import { relativeDay } from '@/lib/dates';
import { areaCounts, minutesOf, sessionMinutes, streak, thisWeek, weeksOnTarget } from '@/lib/progress';
import { useNow } from '@/lib/useNow';
import { useAppStore } from '@/store/useAppStore';

export default function ProgressTab() {
  const plan = useAppStore((s) => s.plan);
  const history = useAppStore((s) => s.history);
  const isPremium = useAppStore((s) => s.isPremium);
  const now = useNow();
  if (!plan) return null;

  const week = thisWeek(history, now);
  const counts = areaCounts(history);
  const shown = counts.length ? counts : plan.areas.map((area) => ({ area, count: 0 }));
  const max = Math.max(1, ...shown.map((c) => c.count));
  const glows = Object.fromEntries(shown.filter((c) => c.count > 0).map((c) => [c.area, 0.4 + 0.6 * (c.count / max)])) as Partial<Record<AreaId, number>>;

  return (
    <Screen scroll tabBar>
      <View style={styles.header}>
        <T variant="title">Progress</T>
        <IconButton icon="share" label="Share your week" onPress={() => router.push('/share')} />
      </View>

      <Card big style={styles.weekCard}>
        <Ring size={92} stroke={9} progress={week.length / plan.days}>
          <T variant="h2">{`${week.length}/${plan.days}`}</T>
        </Ring>
        <View>
          <T variant="kicker">This week</T>
          <T variant="stat" style={styles.minutes}>{`${minutesOf(week)} min`}</T>
          <T variant="small">{`${week.length} of ${plan.days} sessions`}</T>
        </View>
      </Card>

      <View style={styles.tiles}>
        <Card style={styles.tile}>
          <View style={styles.tileValue}>
            <Icon name="sprout" size={18} color={colors.green} strokeWidth={1.9} />
            <T variant="stat">{String(streak(plan, history, now))}</T>
          </View>
          <T variant="caption" style={{ fontSize: 12 }}>
            Day streak
          </T>
        </Card>
        <Card style={styles.tile}>
          <T variant="stat">{String(history.length)}</T>
          <T variant="caption" style={{ fontSize: 12 }}>
            Sessions
          </T>
        </Card>
        <Card style={styles.tile}>
          <T variant="stat">{String(weeksOnTarget(plan, history, now))}</T>
          <T variant="caption" style={{ fontSize: 12 }}>
            Weeks on target
          </T>
        </Card>
      </View>

      <T variant="kicker" style={styles.section}>
        Recent
      </T>
      <View style={styles.recent}>
        {history.length === 0 ? (
          <View style={styles.recentRow}>
            <PoseBubble pose="child" size={44} color={REGION_COLORS.lowerBack} dot={false} />
            <T variant="small" style={styles.flex}>
              Your sessions will show here. Rest is part of it too.
            </T>
          </View>
        ) : (
          history.slice(0, 3).map((h, i) => (
            <View key={h.id} style={styles.recentRow}>
              <PoseBubble pose={h.firstPose} size={36} color={h.areas[0] ? REGION_COLORS[h.areas[0]] : POSE_COLORS[i % POSE_COLORS.length]} dot={false} />
              <View style={styles.flex}>
                <T variant="bodyStrong" numberOfLines={1} style={{ fontSize: 15 }}>
                  {h.title}
                </T>
                <T variant="caption">{relativeDay(h.date, now)}</T>
              </View>
              <T variant="smallStrong">{`${sessionMinutes(h)} min`}</T>
            </View>
          ))
        )}
      </View>

      <Card style={styles.areasCard} onPress={isPremium ? undefined : () => router.push('/premium')} accessibilityLabel="Areas trained">
        <View style={styles.areasTop}>
          <T variant="kicker">Areas trained</T>
          {isPremium ? null : (
            <View style={styles.lockChip}>
              <Icon name="lock" size={10} color={colors.ink} strokeWidth={2.8} />
              <T style={styles.lockText}>Premium</T>
            </View>
          )}
        </View>
        <View style={[styles.areasBody, !isPremium && { opacity: 0.55 }]}>
          <BodyFigure height={84} glows={glows} />
          <View style={styles.bars}>
            {shown.slice(0, 4).map((c) => (
              <View key={c.area} style={styles.barRow}>
                <T variant="smallStrong" style={styles.barLabel}>
                  {AREA_NAMES[c.area]}
                </T>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${(c.count / max) * 100}%` }]} />
                </View>
                <T variant="caption" style={styles.barValue}>
                  {String(c.count)}
                </T>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  weekCard: { marginTop: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 20, borderRadius: 28 },
  minutes: { marginTop: 4, fontSize: 32, lineHeight: 36 },
  tiles: { marginTop: 12, flexDirection: 'row', gap: 10 },
  tile: { flex: 1, height: 84, padding: 14, borderRadius: 20, justifyContent: 'space-between' },
  tileValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  section: { marginTop: 26 },
  recent: { marginTop: 10, gap: 8 },
  recentRow: {
    height: 60,
    borderRadius: 18,
    paddingLeft: 12,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,253,249,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(90,70,40,0.10)',
  },
  areasCard: { marginTop: 16, padding: 18, gap: 12 },
  areasTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lockChip: { height: 24, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(28,26,22,0.07)', flexDirection: 'row', alignItems: 'center', gap: 4 },
  lockText: { fontFamily: fonts.bold, fontSize: 12, color: colors.ink },
  areasBody: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  bars: { flex: 1, gap: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 82, fontSize: 13 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(90,70,40,0.10)', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3, backgroundColor: colors.green },
  barValue: { width: 18, textAlign: 'right' },
});

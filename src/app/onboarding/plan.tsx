import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BodyFigure } from '@/components/BodyFigure';
import { SessionRow } from '@/components/SessionRow';
import { T } from '@/components/T';
import { PrimaryButton, Screen, Stat } from '@/components/ui';
import { colors } from '@/constants/theme';
import { areasLabel } from '@/data/areas';
import { GOAL_LABEL, LEVEL_NAME } from '@/data/content';
import type { AreaId } from '@/data/types';
import { nextSession } from '@/lib/progress';
import { useAppStore } from '@/store/useAppStore';

export default function PlanReady() {
  const plan = useAppStore((s) => s.plan);
  const history = useAppStore((s) => s.history);
  if (!plan) return <Redirect href="/onboarding/areas" />;

  const now = new Date();
  const next = nextSession(plan, history, now);
  const avgMoves = Math.round(plan.sessions.reduce((n, s) => n + s.exerciseIds.length, 0) / plan.sessions.length);
  const glows = Object.fromEntries(plan.areas.map((a) => [a, 0.9])) as Partial<Record<AreaId, number>>;

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.heroFigure}>
          <View style={styles.halo} />
          <BodyFigure height={148} glows={glows} />
        </View>
        <T variant="kicker">Your plan</T>
        <T variant="title" style={styles.title}>
          {areasLabel(plan.areas)}
        </T>
        <T variant="body" color={colors.muted} style={styles.sub}>
          {LEVEL_NAME[plan.level]} · {GOAL_LABEL[plan.goal]}
        </T>
      </View>

      <View style={styles.stats}>
        <Stat value={String(plan.days)} label="days a week" />
        <Stat value={String(plan.minutes)} label="min a session" divider />
        <Stat value={String(avgMoves)} label="moves each" divider />
      </View>

      <View style={styles.weekHeader}>
        <T variant="kicker">Week 1</T>
        <T variant="caption">{plan.sessions.length} sessions</T>
      </View>
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {plan.sessions.map((s) => {
          const isNext = next?.session.id === s.id;
          return (
            <SessionRow
              key={s.id}
              session={s}
              now={now}
              meta={isNext ? `${next?.when === 'upcoming' ? 'Next' : 'Today'} · ${s.minutes} min` : `${s.minutes} min`}
              highlight={isNext}
              trailing="bubbles"
            />
          );
        })}
      </ScrollView>

      <T variant="caption" center style={styles.safety}>
        Move gently, within a comfortable range.
      </T>
      <PrimaryButton
        label="Start first session"
        icon="play"
        onPress={() => {
          const id = next?.session.id ?? plan.sessions[0].id;
          router.push({ pathname: '/session', params: { id } });
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 150, justifyContent: 'center' },
  heroFigure: { position: 'absolute', right: 10, top: 0, alignItems: 'center' },
  halo: { position: 'absolute', left: -50, top: -16, width: 174, height: 174, borderRadius: 87, backgroundColor: 'rgba(47,122,86,0.08)' },
  title: { marginTop: 6, width: 220, fontSize: 38, lineHeight: 40, letterSpacing: -0.6 },
  sub: { marginTop: 10, fontSize: 15 },
  stats: { marginTop: 18, flexDirection: 'row' },
  weekHeader: { marginTop: 26, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  list: { flex: 1, marginTop: 12, marginHorizontal: -24 },
  listContent: { gap: 10, paddingHorizontal: 24, paddingBottom: 8 },
  safety: { marginTop: 10, marginBottom: 14 },
});

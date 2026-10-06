import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BodyFigure } from '@/components/BodyFigure';
import { Icon } from '@/components/Icon';
import { PoseBubble } from '@/components/PoseBubble';
import { T } from '@/components/T';
import type { LookTokens } from '@/constants/looks';
import { fonts, REGION_COLORS } from '@/constants/theme';
import { areasLabel } from '@/data/areas';
import { getExercise } from '@/data/exercises';
import type { AreaId, CompletedSession, PlannedSession } from '@/data/types';
import { alpha } from '@/lib/color';
import { DAY_LONG } from '@/lib/dates';
import { tap } from '@/lib/haptics';
import { sessionMinutes } from '@/lib/progress';

import { streakHint, streakIcon } from './Bento';

type Props = {
  L: LookTokens;
  today: CompletedSession[];
  run: number;
  next: PlannedSession | undefined;
};

/** The last stage of the day: what you did, where it worked, the streak growing and what's next. */
export function DoneStage({ L, today, run, next }: Props) {
  const minutes = today.reduce((t, h) => t + sessionMinutes(h), 0);
  const moves = today.reduce((t, h) => t + h.moves, 0);
  const areas = [...new Set(today.flatMap((h) => h.areas))];
  const glows = Object.fromEntries(areas.map((a) => [a, 1])) as Partial<Record<AreaId, number>>;
  const nextFirst = next ? getExercise(next.exerciseIds[0]) : undefined;

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={[styles.badge, { backgroundColor: L.bright }]}>
          <Icon name="check" size={18} color={L.onBright} strokeWidth={2.8} />
        </View>
        <T style={[styles.title, { color: L.ink }]}>Done for today</T>
      </View>
      <T variant="body" color={L.muted} style={styles.summary}>
        {`${minutes} min · ${moves} moves · ${areasLabel(areas)}`}
      </T>

      <View style={styles.stage}>
        <View style={[styles.halo, { backgroundColor: alpha(L.dark ? '#A6F2C8' : '#2F7A56', L.dark ? 0.08 : 0.07) }]} />
        <BodyFigure height={232} glows={glows} fill={L.figureFill} glowColor={L.glow} />
        <View style={[styles.streak, { backgroundColor: L.chip.bg, borderColor: L.chip.border }]}>
          <Icon name={streakIcon(run)} size={26} color={L.accent} strokeWidth={1.8} />
          <View>
            <T style={[styles.streakValue, { color: L.ink }]}>{`${run} day streak`}</T>
            <T variant="caption" color={L.muted}>
              {streakHint(run)}
            </T>
          </View>
        </View>
      </View>

      <View style={[styles.next, { backgroundColor: L.chip.bg, borderColor: L.chip.border }]}>
        {next ? (
          <>
            <PoseBubble pose={nextFirst?.pose ?? 'reach'} size={48} color={nextFirst ? REGION_COLORS[nextFirst.area] : REGION_COLORS.lowerBack} dot={false} />
            <View style={styles.flex}>
              <T variant="kicker" color={L.accent}>{`Next · ${DAY_LONG[next.weekday]}`}</T>
              <T variant="bodyStrong" color={L.ink} numberOfLines={1}>
                {next.title}
              </T>
              <T variant="caption" color={L.muted}>{`${next.minutes} min · ${next.exerciseIds.length} moves`}</T>
            </View>
          </>
        ) : (
          <T variant="body" color={L.ink}>
            That&apos;s the whole week. See you on Monday.
          </T>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          tap();
          router.push('/share');
        }}
        style={({ pressed }) => [styles.share, { borderColor: L.chip.border, backgroundColor: L.chip.bg }, pressed && { opacity: 0.85 }]}
      >
        <Icon name="share" size={17} color={L.ink} strokeWidth={2} />
        <T variant="bodyStrong" color={L.ink}>
          Share your progress
        </T>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { marginTop: 22 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.6 },
  summary: { marginTop: 8 },
  stage: { marginTop: 14, height: 280, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 260, height: 260, borderRadius: 130 },
  streak: {
    position: 'absolute',
    right: 0,
    bottom: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakValue: { fontFamily: fonts.bold, fontSize: 15 },
  next: { marginTop: 14, padding: 14, borderRadius: 24, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  share: { marginTop: 12, height: 52, borderRadius: 26, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
});

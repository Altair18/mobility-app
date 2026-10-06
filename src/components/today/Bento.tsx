import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BodyFigure } from '@/components/BodyFigure';
import { Icon, type IconName } from '@/components/Icon';
import { PoseBubble } from '@/components/PoseBubble';
import { Ring } from '@/components/Ring';
import { T } from '@/components/T';
import type { LookTokens } from '@/constants/looks';
import { fonts, REGION_COLORS } from '@/constants/theme';
import { AREA_NAMES } from '@/data/areas';
import { PROGRAMMES } from '@/data/content';
import type { AreaId } from '@/data/types';
import { alpha } from '@/lib/color';
import { relativeDay } from '@/lib/dates';
import { tap } from '@/lib/haptics';

/** The streak grows from a seed to a sprout to a plant. */
export function streakIcon(days: number): IconName {
  if (days < 2) return 'seed';
  return days < 5 ? 'sprout' : 'plant';
}

export function streakHint(days: number): string {
  if (days < 2) return `${2 - days} more ${2 - days === 1 ? 'day' : 'days'} until it sprouts`;
  if (days < 5) return `${5 - days} more ${5 - days === 1 ? 'day' : 'days'} until it's grown`;
  return 'Fully grown. Keep it going.';
}

function Tile({ L, children, onPress, label, style }: { L: LookTokens; children: ReactNode; onPress: () => void; label: string; style?: object }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.tile, { backgroundColor: L.chip.bg, borderColor: L.chip.border }, !L.dark && styles.tileShadow, style, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

type Props = {
  L: LookTokens;
  done: number;
  target: number;
  run: number;
  areas: AreaId[];
  last: Partial<Record<AreaId, string>>;
  bodyGlows: Partial<Record<AreaId, number>>;
  now: Date;
  isPremium: boolean;
  programmeDays: Record<string, number>;
  onProgramme: (id: string) => void;
  /** After today's session the streak and body are already shown above, so only the week and a programme remain. */
  variant?: 'full' | 'done';
};

/** Tiles of different sizes in place of stacked sections: week, streak, body and a programme. */
export function Bento({ L, done, target, run, areas, last, bodyGlows, now, isPremium, programmeDays, onProgramme, variant = 'full' }: Props) {
  const ring = L.dark ? L.bright : L.accent;
  const left = Math.max(0, target - done);
  // Feature the programme you're furthest into, or Desk reset to begin with.
  const started = PROGRAMMES.filter((p) => (programmeDays[p.id] ?? 0) > 0).sort((a, b) => programmeDays[b.id] - programmeDays[a.id]);
  const programme = started[0] ?? PROGRAMMES[1];
  const recent = areas.filter((a) => last[a]).sort((a, b) => (last[b] ?? '').localeCompare(last[a] ?? ''))[0];

  const week = (
    <Tile L={L} label={`This week, ${done} of ${target}`} onPress={() => router.navigate('/progress')} style={styles.half}>
      <Ring size={60} stroke={6} progress={done / target} color={ring} track={alpha(L.dark ? '#FFFFFF' : '#1A1915', 0.1)}>
        <T style={[styles.ringText, { color: L.ink }]}>{`${done}/${target}`}</T>
      </Ring>
      <View>
        <T variant="kicker" color={L.accent}>
          This week
        </T>
        <T variant="caption" color={L.muted} style={{ marginTop: 2 }}>
          {left === 0 ? 'All done' : `${left} to go`}
        </T>
      </View>
    </Tile>
  );

  const programmeTile = (
    <View style={[styles.tile, { backgroundColor: L.chip.bg, borderColor: L.chip.border }, !L.dark && styles.tileShadow, variant === 'done' ? styles.half : styles.tall]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={programme.title}
        onPress={() => {
          tap();
          onProgramme(programme.id);
        }}
        style={({ pressed }) => [styles.programmeBody, pressed && { opacity: 0.8 }]}
      >
        <View style={styles.programmeTop}>
        <PoseBubble pose={programme.pose} size={variant === 'done' ? 52 : 72} color={REGION_COLORS[programme.areas[0]]} dot={false} />
          {isPremium ? null : <Icon name="lock" size={15} color={L.muted} strokeWidth={2.2} />}
        </View>
        <View>
          <T variant="kicker" color={L.accent}>
            Programme
          </T>
          <T variant="bodyStrong" color={L.ink} style={{ marginTop: 2 }}>
            {programme.title}
          </T>
          <T variant="caption" color={L.muted}>
            {isPremium && programmeDays[programme.id] ? `Day ${Math.min(programme.days, programmeDays[programme.id] + 1)} of ${programme.days}` : programme.meta}
          </T>
        </View>
      </Pressable>
      {variant === 'full' ? (
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/plan')} hitSlop={8} style={styles.allLink}>
          <T variant="smallStrong" color={L.ink}>
            All programmes
          </T>
          <Icon name="chevron" size={13} color={L.ink} strokeWidth={2.2} />
        </Pressable>
      ) : null}
    </View>
  );

  if (variant === 'done') {
    return (
      <View style={styles.row}>
        {week}
        {programmeTile}
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {week}
        <Tile L={L} label={`${run} day streak`} onPress={() => router.navigate('/progress')} style={styles.half}>
          <View style={styles.streakTop}>
            <Icon name={streakIcon(run)} size={34} color={L.accent} strokeWidth={1.7} />
            <T style={[styles.streakValue, { color: L.ink }]}>{String(run)}</T>
          </View>
          <View>
            <T variant="kicker" color={L.accent}>
              Day streak
            </T>
            <T variant="caption" color={L.muted} style={{ marginTop: 2 }} numberOfLines={2}>
              {streakHint(run)}
            </T>
          </View>
        </Tile>
      </View>
      <View style={styles.row}>
        <Tile L={L} label="Your body this week" onPress={() => router.push('/edit-areas')} style={styles.tall}>
          <T variant="kicker" color={L.accent}>
            Your body
          </T>
          <View style={styles.figure}>
            <BodyFigure height={140} glows={bodyGlows} fill={L.figureFill} glowColor={L.glow} />
          </View>
          <T variant="caption" color={L.muted} numberOfLines={1}>
            {recent ? `${AREA_NAMES[recent]} · ${relativeDay(last[recent] ?? '', now)}` : 'Nothing trained yet'}
          </T>
        </Tile>
        {programmeTile}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { marginTop: 18, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, borderRadius: 26, borderWidth: 1, padding: 16, justifyContent: 'space-between' },
  tileShadow: { boxShadow: '0px 10px 24px -16px rgba(70,50,20,0.35)' },
  half: { height: 140 },
  tall: { height: 236 },
  pressed: { transform: [{ scale: 0.97 }], opacity: 0.92 },
  ringText: { fontFamily: fonts.bold, fontSize: 15, fontVariant: ['tabular-nums'] },
  streakTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakValue: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, fontVariant: ['tabular-nums'] },
  figure: { alignItems: 'center' },
  programmeBody: { flex: 1, justifyContent: 'space-between' },
  programmeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  allLink: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 3 },
});

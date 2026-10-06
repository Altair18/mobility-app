import { StyleSheet, View } from 'react-native';

import { colors, fonts, REGION_COLORS } from '@/constants/theme';
import { getExercise } from '@/data/exercises';
import type { Exercise, PlannedSession } from '@/data/types';
import { DAY_SHORT, dateOfWeekday } from '@/lib/dates';

import { Icon } from './Icon';
import { PoseBubble } from './PoseBubble';
import { T } from './T';
import { Card, SandPill } from './ui';

export type RowTrailing = 'bubbles' | 'done' | 'start' | 'locked';

type Props = {
  session: PlannedSession;
  now: Date;
  meta: string;
  highlight?: boolean;
  trailing: RowTrailing;
  onPress?: () => void;
};

/** One session in a week list: day, name, details, and a status on the right. */
export function SessionRow({ session, now, meta, highlight, trailing, onPress }: Props) {
  const moves = session.exerciseIds
    .map((id) => getExercise(id))
    .filter((e, i, all): e is Exercise => !!e && all.findIndex((x) => x?.pose === e.pose) === i)
    .slice(0, 3);

  return (
    <Card onPress={onPress} highlight={highlight} style={styles.row} accessibilityLabel={`${session.title}, ${meta}`}>
      <View style={styles.day}>
        <T style={[styles.dayName, highlight && { color: colors.greenText }]}>{DAY_SHORT[session.weekday]}</T>
        <T style={styles.dayNum}>{String(dateOfWeekday(session.weekday, now).getDate())}</T>
      </View>
      <View style={styles.text}>
        <T variant="bodyStrong" numberOfLines={1}>
          {session.title}
        </T>
        <T variant="caption" style={{ marginTop: 2 }}>
          {meta}
        </T>
      </View>
      {trailing === 'bubbles' ? (
        <View style={styles.stack}>
          {moves.map((e, i) => (
            <PoseBubble key={e.pose} pose={e.pose} size={30} color={REGION_COLORS[e.area]} dot={false} outline style={i > 0 ? styles.overlap : undefined} />
          ))}
        </View>
      ) : null}
      {trailing === 'done' ? (
        <View style={styles.done} accessibilityLabel="Done">
          <Icon name="check" size={15} color={colors.white} strokeWidth={3} />
        </View>
      ) : null}
      {trailing === 'start' ? <SandPill small /> : null}
      {trailing === 'locked' ? (
        <View style={styles.locked} accessibilityLabel="Premium">
          <Icon name="lock" size={13} color={colors.muted} strokeWidth={2.4} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { height: 68, borderRadius: 20, paddingLeft: 10, paddingRight: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  day: { width: 44, alignItems: 'center' },
  dayName: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.8, color: colors.muted },
  dayNum: { fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: colors.ink },
  text: { flex: 1, minWidth: 0 },
  stack: { flexDirection: 'row' },
  overlap: { marginLeft: -9 },
  done: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  locked: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(90,70,40,0.22)', alignItems: 'center', justifyContent: 'center' },
});

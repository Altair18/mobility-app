import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '@/constants/theme';
import type { DayStatus } from '@/lib/progress';

import { Icon } from './Icon';

type Day = { weekday: number; letter: string; status: DayStatus; isToday: boolean };

/** Seven day circles: done, today, planned, missed or rest. */
/** Colours for a themed week row; completed days can glow. */
type Tone = { ink: string; muted: string; done: string; onDone: string; glow?: boolean };

export function WeekStrip({ days, size = 34, tone }: { days: Day[]; size?: number; tone?: Tone }) {
  return (
    <View style={styles.row}>
      {days.map((d) => {
        const done = d.status === 'done';
        const ring =
          d.status === 'today' || (d.isToday && !done)
            ? { borderWidth: 2, borderColor: tone?.ink ?? colors.ink }
            : d.status === 'planned'
              ? { borderWidth: 1.5, borderColor: 'rgba(47,122,86,0.65)', borderStyle: 'dashed' as const }
              : d.status === 'missed'
                ? { borderWidth: 1.5, borderColor: colors.line }
                : null;
        const ink = d.status === 'today' || d.isToday ? (tone?.ink ?? colors.ink) : d.status === 'planned' ? (tone ? tone.ink : colors.greenText) : (tone?.muted ?? colors.faint);
        return (
          <View
            key={d.weekday}
            accessibilityLabel={`${d.letter} ${d.status}`}
            style={[
              styles.day,
              { width: size, height: size, borderRadius: size / 2 },
              done && styles.done,
              done && tone && { backgroundColor: tone.done },
              done && tone?.glow && { boxShadow: `0px 0px 14px ${tone.done}` },
              ring,
            ]}
          >
            {done ? <Icon name="check" size={14} color={tone?.onDone ?? colors.white} strokeWidth={3} /> : <Text style={[styles.letter, { color: ink }]}>{d.letter}</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', justifyContent: 'center' },
  done: { backgroundColor: colors.green },
  letter: { fontFamily: fonts.bold, fontSize: 12 },
});

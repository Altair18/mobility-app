import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BodyFigure } from '@/components/BodyFigure';
import { Icon, type IconName } from '@/components/Icon';
import { T } from '@/components/T';
import { IconButton, PrimaryButton, Screen, TextButton } from '@/components/ui';
import { colors, fonts, shadows } from '@/constants/theme';
import type { ReminderSlot } from '@/data/types';
import { timeLabel } from '@/lib/dates';
import { continueFirstRun } from '@/lib/flow';
import { tap } from '@/lib/haptics';
import { cancelReminders, scheduleReminders } from '@/lib/notifications';
import { nextSession } from '@/lib/progress';
import { useViewport } from '@/lib/viewport';
import { useAppStore } from '@/store/useAppStore';

const SLOTS: { id: ReminderSlot; label: string; icon: IconName; hour: number; minute: number }[] = [
  { id: 'morning', label: 'Morning', icon: 'sunrise', hour: 8, minute: 0 },
  { id: 'afternoon', label: 'Afternoon', icon: 'sun', hour: 13, minute: 0 },
  { id: 'evening', label: 'Evening', icon: 'moon', hour: 19, minute: 0 },
  { id: 'custom', label: 'Custom', icon: 'clock', hour: 7, minute: 30 },
];

export default function ReminderScreen() {
  const { flow, edit } = useLocalSearchParams<{ flow?: string; edit?: string }>();
  const editing = edit === '1';
  const plan = useAppStore((s) => s.plan);
  const history = useAppStore((s) => s.history);
  const saved = useAppStore((s) => s.reminder);
  const setReminder = useAppStore((s) => s.setReminder);
  const setFlag = useAppStore((s) => s.setFlag);
  const [slot, setSlot] = useState<ReminderSlot>(saved?.slot ?? 'evening');
  const [custom, setCustom] = useState({ hour: saved?.slot === 'custom' ? saved.hour : 7, minute: saved?.slot === 'custom' ? saved.minute : 30 });
  const [note, setNote] = useState('');
  const compact = useViewport().height < 760;

  useEffect(() => {
    if (flow === '1') setFlag('seenReminder');
  }, [flow, setFlag]);

  const next = () => (editing ? router.back() : continueFirstRun('reminder'));
  const upcoming = plan ? nextSession(plan, history, new Date())?.session : undefined;

  const remind = async () => {
    if (!plan) return next();
    const base = SLOTS.find((s) => s.id === slot)!;
    const time = slot === 'custom' ? custom : { hour: base.hour, minute: base.minute };
    const reminder = { slot, ...time };
    const ok = await scheduleReminders(plan, reminder);
    if (ok) {
      setReminder(reminder);
      next();
    } else {
      setReminder(null);
      setNote('Notifications are off for this app. Turn them on in your phone’s Settings.');
    }
  };

  const skip = async () => {
    await cancelReminders();
    setReminder(null);
    next();
  };

  const stepHour = (d: number) => setCustom((c) => ({ ...c, hour: (c.hour + d + 24) % 24 }));
  const stepMinute = (d: number) => setCustom((c) => ({ ...c, minute: (c.minute + d + 60) % 60 }));

  return (
    <Screen>
      {editing ? <IconButton icon="back" label="Back" onPress={() => router.back()} /> : <View style={{ height: 44 }} />}
      <View style={styles.preview}>
        <View style={styles.appIcon}>
          <BodyFigure height={30} fill={colors.cream} />
        </View>
        <View style={styles.flex}>
          <View style={styles.previewTop}>
            <T variant="bodyStrong" style={{ fontSize: 15, fontFamily: fonts.bold }}>
              Time to move
            </T>
            <T variant="caption" style={{ fontSize: 12 }}>
              now
            </T>
          </View>
          <T variant="small">{upcoming ? `${upcoming.title} · ${upcoming.minutes} min` : 'Your session · 10 min'}</T>
        </View>
      </View>
      <T variant="title" center style={[styles.title, compact && { marginTop: 24 }]}>
        {editing ? 'Reminders' : 'Want a reminder?'}
      </T>
      <T variant="body" color={colors.muted} center style={{ marginTop: 8 }}>
        A gentle nudge on your plan days, at a time that suits you.
      </T>
      <View style={[styles.grid, compact && { marginTop: 18 }]}>
        {SLOTS.map((s) => {
          const on = slot === s.id;
          const time = s.id === 'custom' ? (on ? timeLabel(custom.hour, custom.minute) : 'Pick a time') : timeLabel(s.hour, s.minute);
          return (
            <Pressable
              key={s.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => {
                tap();
                setSlot(s.id);
              }}
              style={[styles.tile, compact && styles.tileCompact, on && styles.tileOn]}
            >
              <Icon name={s.icon} size={24} color={colors.green} />
              <View>
                <T variant="bodyStrong">{s.label}</T>
                <T variant="caption" style={{ marginTop: 2 }}>
                  {time}
                </T>
              </View>
            </Pressable>
          );
        })}
      </View>
      {slot === 'custom' ? (
        <View style={styles.stepper}>
          <Stepper label="Hour" onMinus={() => stepHour(-1)} onPlus={() => stepHour(1)} />
          <T variant="h2">{timeLabel(custom.hour, custom.minute)}</T>
          <Stepper label="Minutes" onMinus={() => stepMinute(-15)} onPlus={() => stepMinute(15)} />
        </View>
      ) : null}
      <View style={styles.flex} />
      {note ? (
        <T variant="caption" center style={{ marginBottom: 10 }}>
          {note}
        </T>
      ) : null}
      <PrimaryButton label={editing ? 'Save' : 'Remind me'} onPress={remind} />
      <TextButton label={editing && saved ? 'Turn off reminders' : 'Not now'} onPress={skip} style={{ marginTop: 6 }} />
    </Screen>
  );
}

function Stepper({ label, onMinus, onPlus }: { label: string; onMinus: () => void; onPlus: () => void }) {
  return (
    <View style={styles.stepGroup}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label} earlier`} onPress={onMinus} style={styles.stepButton}>
        <Icon name="minus" size={16} color={colors.ink} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label} later`} onPress={onPlus} style={styles.stepButton}>
        <Icon name="plus" size={16} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  preview: {
    marginTop: 28,
    padding: 14,
    paddingRight: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,253,249,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0px 18px 34px -18px rgba(70,50,20,0.4)',
  },
  appIcon: { width: 42, height: 42, borderRadius: 11, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { marginTop: 40, fontSize: 34, lineHeight: 38 },
  grid: { marginTop: 28, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47.5%',
    flexGrow: 1,
    height: 100,
    borderRadius: 22,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '#FFFBF4',
    borderWidth: 1,
    borderColor: 'rgba(90,70,40,0.14)',
  },
  tileCompact: { height: 84, padding: 14 },
  tileOn: { borderWidth: 2, borderColor: colors.green, boxShadow: shadows.small },
  stepper: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepGroup: { flexDirection: 'row', gap: 8 },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFBF4',
    borderWidth: 1,
    borderColor: 'rgba(90,70,40,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

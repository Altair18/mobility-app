import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Plan, Reminder } from '@/data/types';

export function setupNotifications(): void {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('reminders', {
      name: 'Session reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    }).catch(() => undefined);
  }
}

/** Our weekdays are 0 = Monday … 6 = Sunday. Expo uses 1 = Sunday … 7 = Saturday. */
function toExpoWeekday(weekday: number): number {
  return ((weekday + 1) % 7) + 1;
}

/** Schedules a weekly reminder on each planned day. Returns false if permission was refused. */
export async function scheduleReminders(plan: Plan, reminder: Reminder): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const session of plan.sessions) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Time to move', body: `${session.title} · ${session.minutes} min` },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: toExpoWeekday(session.weekday),
        hour: reminder.hour,
        minute: reminder.minute,
        channelId: Platform.OS === 'android' ? 'reminders' : undefined,
      },
    });
  }
  return true;
}

export async function cancelReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

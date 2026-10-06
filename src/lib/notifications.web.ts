import type { Plan, Reminder } from '@/data/types';

// The browser preview has no notification scheduling; the reminder screen explains this.
export function setupNotifications(): void {}

export async function scheduleReminders(_plan: Plan, _reminder: Reminder): Promise<boolean> {
  return false;
}

export async function cancelReminders(): Promise<void> {}

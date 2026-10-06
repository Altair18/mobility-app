import { config } from '@/constants/config';
import { AREA_ORDER } from '@/data/areas';
import type { AreaId, CompletedSession, Plan, PlannedSession } from '@/data/types';
import { addDays, DAY_LETTER, daysBetween, dateOfWeekday, isSameDay, startOfDay, startOfWeek, weekdayIndex } from './dates';

export function inWeekOf(iso: string, now: Date): boolean {
  const d = new Date(iso);
  const start = startOfWeek(now);
  return d >= start && d < addDays(start, 7);
}

export function thisWeek(history: CompletedSession[], now: Date): CompletedSession[] {
  return history.filter((h) => inWeekOf(h.date, now));
}

export function doneThisWeek(history: CompletedSession[], now: Date): Set<string> {
  return new Set(thisWeek(history, now).map((h) => h.sessionId));
}

/** A session always counts for at least a minute, so quick ones never show as "0 min". */
export function sessionMinutes(h: CompletedSession): number {
  return Math.max(1, Math.round(h.seconds / 60));
}

export function minutesOf(list: CompletedSession[]): number {
  return list.reduce((sum, h) => sum + sessionMinutes(h), 0);
}

export type DayStatus = 'done' | 'today' | 'planned' | 'missed' | 'rest';

export function weekDays(plan: Plan, history: CompletedSession[], now: Date) {
  const today = weekdayIndex(now);
  const week = thisWeek(history, now);
  const doneIds = doneThisWeek(history, now);
  return [0, 1, 2, 3, 4, 5, 6].map((weekday) => {
    const date = dateOfWeekday(weekday, now);
    const did = week.some((h) => isSameDay(new Date(h.date), date));
    // A day's session done early (on another day) leaves nothing planned that day.
    const planned = plan.sessions.some((s) => s.weekday === weekday && !doneIds.has(s.id));
    let status: DayStatus = 'rest';
    if (did) status = 'done';
    else if (planned && weekday === today) status = 'today';
    else if (planned) status = weekday < today ? 'missed' : 'planned';
    return { weekday, letter: DAY_LETTER[weekday], status, isToday: weekday === today, date };
  });
}

export type NextSession = { session: PlannedSession; when: 'today' | 'catchup' | 'upcoming' };

/** The session to show on the Today card. Null when the whole week is done. */
export function nextSession(plan: Plan, history: CompletedSession[], now: Date): NextSession | null {
  const done = doneThisWeek(history, now);
  const today = weekdayIndex(now);
  const pending = plan.sessions.filter((s) => !done.has(s.id));
  if (pending.length === 0) return null;
  const todays = pending.find((s) => s.weekday === today);
  if (todays) return { session: todays, when: 'today' };
  const didToday = history.some((h) => isSameDay(new Date(h.date), now));
  const missed = pending.find((s) => s.weekday < today);
  if (missed && !didToday) return { session: missed, when: 'catchup' };
  const upcoming = pending.find((s) => s.weekday > today);
  if (upcoming) return { session: upcoming, when: 'upcoming' };
  return { session: pending[0], when: 'catchup' };
}

/** True when a planned session for that day wasn't done at any point in its week. */
function openSessionOn(plan: Plan, history: CompletedSession[], day: Date): boolean {
  return plan.sessions.some((s) => s.weekday === weekdayIndex(day) && !history.some((h) => h.sessionId === s.id && inWeekOf(h.date, day)));
}

/** Days in a row with a session. Rest days don't break the run; a missed planned day does. */
export function streak(plan: Plan, history: CompletedSession[], now: Date): number {
  const days = new Set(history.map((h) => startOfDay(new Date(h.date)).getTime()));
  const planStart = startOfDay(new Date(plan.createdAt));
  let d = startOfDay(now);
  if (!days.has(d.getTime())) d = addDays(d, -1);
  let count = 0;
  for (let i = 0; i < 400 && d >= planStart; i++) {
    if (days.has(d.getTime())) count += 1;
    else if (openSessionOn(plan, history, d)) break;
    d = addDays(d, -1);
  }
  return count;
}

/** Weeks (including this one) where the weekly target was reached. */
export function weeksOnTarget(plan: Plan, history: CompletedSession[], now: Date): number {
  let weeks = 0;
  let start = startOfWeek(new Date(plan.createdAt));
  const current = startOfWeek(now);
  while (start <= current) {
    const end = addDays(start, 7);
    const count = history.filter((h) => {
      const d = new Date(h.date);
      return d >= start && d < end;
    }).length;
    if (count >= plan.days) weeks += 1;
    start = end;
  }
  return weeks;
}

export function weekNumber(plan: Plan, now: Date): number {
  return Math.floor(daysBetween(startOfWeek(new Date(plan.createdAt)), startOfWeek(now)) / 7) + 1;
}

export function areaCounts(history: CompletedSession[]): { area: AreaId; count: number }[] {
  const counts = new Map<AreaId, number>();
  for (const h of history) for (const a of h.areas) counts.set(a, (counts.get(a) ?? 0) + 1);
  return AREA_ORDER.filter((a) => counts.has(a)).map((area) => ({ area, count: counts.get(area) ?? 0 }));
}

/** Free users get a few sessions a week; Premium is unlimited. */
export function canStartSession(isPremium: boolean, history: CompletedSession[], now: Date): boolean {
  return isPremium || thisWeek(history, now).length < config.freeWeeklySessions;
}

export function freeSessionsLeft(history: CompletedSession[], now: Date): number {
  return Math.max(0, config.freeWeeklySessions - thisWeek(history, now).length);
}

/** When each area was last trained, newest first per area. Areas never trained are left out. */
export function lastTrained(history: CompletedSession[]): Partial<Record<AreaId, string>> {
  const out: Partial<Record<AreaId, string>> = {};
  for (const h of history) {
    for (const a of h.areas) if (!out[a] || h.date > out[a]) out[a] = h.date;
  }
  return out;
}

/** Glow strength for an area trained `days` ago: bright today, fading over about a week. */
export function recencyGlow(days: number): number {
  if (days > 7) return 0;
  return Math.max(0.2, 1 - days * 0.16);
}

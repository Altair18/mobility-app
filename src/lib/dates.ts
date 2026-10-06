export const DAY_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
export const DAY_LETTER = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
export const DAY_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** 0 = Monday … 6 = Sunday */
export function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function startOfDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function startOfWeek(d: Date): Date {
  const s = startOfDay(d);
  return addDays(s, -weekdayIndex(s));
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);
}

/** The date of a weekday in the same week as `now`. */
export function dateOfWeekday(weekday: number, now: Date): Date {
  return addDays(startOfWeek(now), weekday);
}

/** "9 OCTOBER" */
export function headerDate(now: Date): string {
  return `${now.getDate()} ${MONTHS[now.getMonth()].toUpperCase()}`;
}

/** "Today", "Yesterday", "Wednesday" or "2 Oct". */
export function relativeDay(iso: string, now: Date): string {
  const d = new Date(iso);
  const diff = daysBetween(d, now);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return DAY_LONG[weekdayIndex(d)];
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}

/** "morning", "afternoon" or "evening", for the Today header. */
export function partOfDay(now: Date): string {
  const h = now.getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

/** "7:00 pm" */
export function timeLabel(hour: number, minute: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const m = minute < 10 ? `0${minute}` : String(minute);
  return `${h}:${m} ${hour < 12 ? 'am' : 'pm'}`;
}

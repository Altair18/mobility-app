import type { AreaId, Goal, Level, Minutes, DaysPerWeek, PoseKey } from './types';

export const GOALS: { id: Goal; label: string }[] = [
  { id: 'freely', label: 'Move freely' },
  { id: 'flexibility', label: 'Flexibility' },
  { id: 'stiffness', label: 'Less stiffness' },
  { id: 'sport', label: 'Gym & sport' },
  { id: 'everyday', label: 'Everyday movement' },
];

export const GOAL_LABEL: Record<Goal, string> = Object.fromEntries(GOALS.map((g) => [g.id, g.label])) as Record<Goal, string>;

export const LEVELS: { id: Level; label: string; name: string }[] = [
  { id: 1, label: 'New to mobility', name: 'Beginner' },
  { id: 2, label: 'Some experience', name: 'Intermediate' },
  { id: 3, label: 'I train it regularly', name: 'Advanced' },
];

export const LEVEL_NAME: Record<Level, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

export const DAY_OPTIONS: DaysPerWeek[] = [2, 3, 4, 5, 7];
export const MINUTE_OPTIONS: Minutes[] = [5, 10, 15, 20];

/** Which weekdays (0 = Monday) each weekly target uses. */
export const DAY_PATTERNS: Record<DaysPerWeek, number[]> = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 2, 4, 6],
  5: [0, 1, 3, 4, 6],
  7: [0, 1, 2, 3, 4, 5, 6],
};

export type Programme = {
  id: string;
  title: string;
  meta: string;
  areas: AreaId[];
  days: number;
  minutes: Minutes;
  pose: PoseKey;
  color: string;
};

/** Premium programmes. Each day builds a session for these areas. */
export const PROGRAMMES: Programme[] = [
  { id: 'hips-14', title: '14-day hips', meta: '14 days', areas: ['hips'], days: 14, minutes: 10, pose: 'lunge', color: '#9FBFA8' },
  { id: 'desk', title: 'Desk reset', meta: '5 min a day', areas: ['neck', 'shoulders', 'upperBack'], days: 7, minutes: 5, pose: 'reach', color: '#93A9BC' },
  { id: 'morning', title: 'Morning flow', meta: '7 days', areas: ['upperBack', 'lowerBack', 'hips'], days: 7, minutes: 10, pose: 'cat', color: '#D9BE93' },
  { id: 'post-gym', title: 'Post-gym', meta: '7 days', areas: ['hips', 'knees', 'ankles'], days: 7, minutes: 10, pose: 'squat', color: '#D49A7C' },
];

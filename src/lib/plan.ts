import { AREA_NAMES, FOCUS_TITLES, sortAreas } from '@/data/areas';
import { DAY_PATTERNS, type Programme } from '@/data/content';
import { EXERCISES, moveSeconds } from '@/data/exercises';
import type { AreaId, DaysPerWeek, Exercise, Goal, Level, Minutes, Plan, PlannedSession, SessionKind } from '@/data/types';
import { weekdayIndex } from './dates';

export type AreaLevels = Partial<Record<AreaId, Level>>;

/** Seconds allowed between moves when filling a session. */
const TRANSITION = 10;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function jitter(seed: number, id: string): number {
  return (hash(`${seed}:${id}`) % 1000) / 1000;
}

type PickInput = {
  areas: AreaId[];
  levels: AreaLevels;
  fallbackLevel: Level;
  goal: Goal;
  minutes: Minutes;
  recovery: boolean;
  seed: number;
};

/** Areas that share muscles, used to add variety when an area has few moves at someone's level. */
const NEIGHBOURS: Record<AreaId, AreaId[]> = {
  neck: ['shoulders', 'upperBack'],
  shoulders: ['upperBack', 'neck', 'elbows'],
  elbows: ['wrists', 'shoulders'],
  wrists: ['elbows', 'shoulders'],
  upperBack: ['shoulders', 'lowerBack'],
  lowerBack: ['hips', 'upperBack'],
  hips: ['lowerBack', 'knees'],
  knees: ['hips', 'ankles'],
  ankles: ['knees', 'feet'],
  feet: ['ankles', 'knees'],
};

/** Moves for one area at or below a level: moves at the level first, then ones that suit the goal. */
function rankedMoves(area: AreaId, level: Level, goal: Goal, seed: number): Exercise[] {
  return EXERCISES.filter((e) => e.area === area && e.level <= level)
    .map((e) => ({ e, score: (e.level === level ? 2 : 0) + (e.goals.includes(goal) ? 1 : 0) + jitter(seed, e.id) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.e);
}

/** Takes one move from each list in turn, so every area gets time. */
function interleave(lists: Exercise[][]): Exercise[] {
  const out: Exercise[] = [];
  const longest = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < longest; i++) {
    for (const list of lists) {
      if (list[i]) out.push(list[i]);
    }
  }
  return out;
}

/** Spreads extra moves evenly between the main ones. */
function spread(main: Exercise[], extra: Exercise[]): Exercise[] {
  if (extra.length === 0) return main;
  const out: Exercise[] = [];
  const step = (main.length + 1) / (extra.length + 1);
  let j = 0;
  main.forEach((e, i) => {
    out.push(e);
    while (j < extra.length && (j + 1) * step <= i + 1) out.push(extra[j++]);
  });
  while (j < extra.length) out.push(extra[j++]);
  return out;
}

/**
 * Rule-based selection. Experience level decides which moves are allowed (it matters most);
 * the goal only nudges the order. Areas are interleaved so each gets time. When an area has
 * few moves at someone's level, related areas fill in, so a session is never two moves on a
 * loop. The list is then done in up to two rounds until the session length is filled, so no
 * move appears more than twice.
 */
export function pickExercises({ areas, levels, fallbackLevel, goal, minutes, recovery, seed }: PickInput): string[] {
  const budget = minutes * 60;
  const sorted = sortAreas(areas);
  const levelOf = (area: AreaId): Level => (recovery ? 1 : (levels[area] ?? fallbackLevel));

  const main = interleave(sorted.map((area) => rankedMoves(area, levelOf(area), goal, seed)));

  // Enough different moves to fill at least half the session (the rest is a second round), and at least five.
  const cost = (e: Exercise) => moveSeconds(e) + TRANSITION;
  const enough = (list: Exercise[]) => list.length >= 5 && list.reduce((t, e) => t + cost(e), 0) >= budget / 2;
  const borrowed: Exercise[] = [];
  const seen = new Set<AreaId>(sorted);
  let ring: AreaId[] = sorted;
  // Look one step further out each time: neighbours, then their neighbours.
  while (!enough([...main, ...borrowed])) {
    ring = [...new Set(ring.flatMap((a) => NEIGHBOURS[a]))].filter((a) => !seen.has(a));
    if (ring.length === 0) break;
    ring.forEach((a) => seen.add(a));
    for (const e of interleave(ring.map((area) => rankedMoves(area, levelOf(area), goal, seed)))) {
      if (enough([...main, ...borrowed])) break;
      borrowed.push(e);
    }
  }
  const order = spread(main, borrowed);
  if (order.length === 0) return [];

  const picked: string[] = [];
  let used = 0;
  for (let round = 0; round < 2 && used < budget - 20; round++) {
    for (const e of order) {
      if (picked.length >= 24) break;
      // Never the same move twice in a row, and skip moves too long for the time left.
      if (picked[picked.length - 1] === e.id) continue;
      if (picked.length >= 3 && used + cost(e) > budget + 20) continue;
      picked.push(e.id);
      used += cost(e);
    }
  }
  return picked;
}

export function sessionTitle(kind: SessionKind, areas: AreaId[]): string {
  if (kind === 'recovery') return 'Recovery flow';
  const sorted = sortAreas(areas);
  if (sorted.length === 1) return kind === 'mixed' ? AREA_NAMES[sorted[0]] : FOCUS_TITLES[sorted[0]];
  if (sorted.length === 2) return sorted.map((a) => AREA_NAMES[a]).join(' + ');
  return 'Full-body flow';
}

type PlanInput = {
  areas: AreaId[];
  goal: Goal;
  level: Level;
  days: DaysPerWeek;
  minutes: Minutes;
  levels: AreaLevels;
};

/**
 * Weekly template: alternate "all your areas" sessions with single-area focus sessions,
 * and finish weeks of 4+ sessions with a gentle recovery flow.
 */
export function generateSessions({ areas, goal, level, days, minutes, levels }: PlanInput): PlannedSession[] {
  const sorted = sortAreas(areas);
  const weekdays = DAY_PATTERNS[days];
  const n = weekdays.length;
  let focus = 0;

  return weekdays.map((weekday, i) => {
    let kind: SessionKind;
    let sessionAreas: AreaId[];
    if (i === n - 1 && n >= 4) {
      kind = 'recovery';
      sessionAreas = sorted;
    } else if (sorted.length === 1) {
      kind = 'focus';
      sessionAreas = sorted;
    } else if (i % 2 === 0) {
      kind = 'mixed';
      sessionAreas = sorted;
    } else {
      kind = 'focus';
      sessionAreas = [sorted[sorted.length - 1 - (focus % sorted.length)]];
      focus += 1;
    }
    return {
      id: `s${i}`,
      weekday,
      title: sessionTitle(kind, sessionAreas),
      kind,
      areas: sessionAreas,
      exerciseIds: pickExercises({ areas: sessionAreas, levels, fallbackLevel: level, goal, minutes, recovery: kind === 'recovery', seed: i + 1 }),
      minutes,
    };
  });
}

export function buildPlan(input: PlanInput): Plan {
  return {
    areas: sortAreas(input.areas),
    goal: input.goal,
    level: input.level,
    days: input.days,
    minutes: input.minutes,
    sessions: generateSessions(input),
    createdAt: new Date().toISOString(),
  };
}

/** A one-off session for "Where are you stiff today?" (Premium). */
export function makeQuickSession(area: AreaId, plan: Plan, levels: AreaLevels): PlannedSession {
  return {
    id: 'quick',
    weekday: weekdayIndex(new Date()),
    title: FOCUS_TITLES[area],
    kind: 'quick',
    areas: [area],
    exerciseIds: pickExercises({ areas: [area], levels, fallbackLevel: plan.level, goal: plan.goal, minutes: plan.minutes, recovery: false, seed: Date.now() % 997 }),
    minutes: plan.minutes,
  };
}

/** The answer to "How's your body today?" on the Today screen. */
export type CheckIn = 'good' | 'sore' | 'short';

/**
 * Today's session reshaped by the check-in: sore keeps the areas but uses only gentle (level 1) moves,
 * short on time makes a 5-minute version. Finishing it counts as the planned session.
 */
export function adjustSession(base: PlannedSession, checkIn: CheckIn, plan: Plan, levels: AreaLevels): PlannedSession {
  if (checkIn === 'good') return base;
  const minutes: Minutes = checkIn === 'short' ? 5 : base.minutes;
  return {
    ...base,
    id: `${base.id}-${checkIn}`,
    minutes,
    exerciseIds: pickExercises({ areas: base.areas, levels, fallbackLevel: plan.level, goal: plan.goal, minutes, recovery: checkIn === 'sore', seed: hash(base.id) % 997 }),
    replaces: base.id,
  };
}

/** Today's session for a Premium programme. */
export function makeProgrammeSession(programme: Programme, day: number, plan: Plan, levels: AreaLevels): PlannedSession {
  return {
    id: `prog-${programme.id}`,
    weekday: weekdayIndex(new Date()),
    title: `${programme.title} · Day ${day}`,
    kind: 'programme',
    areas: programme.areas,
    exerciseIds: pickExercises({ areas: programme.areas, levels, fallbackLevel: plan.level, goal: plan.goal, minutes: programme.minutes, recovery: false, seed: day * 31 }),
    minutes: programme.minutes,
    programmeId: programme.id,
  };
}

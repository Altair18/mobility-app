import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { sortAreas } from '@/data/areas';
import { PROGRAMMES } from '@/data/content';
import { getExercise } from '@/data/exercises';
import type {
  Account,
  AreaId,
  CompletedSession,
  DaysPerWeek,
  Feedback,
  Goal,
  Level,
  Minutes,
  Plan,
  PlannedSession,
  Reminder,
} from '@/data/types';
import { scheduleReminders } from '@/lib/notifications';
import { buildPlan, generateSessions, makeProgrammeSession, makeQuickSession, type AreaLevels } from '@/lib/plan';

/** Device storage that never blocks the app: if saving or loading fails, it carries on without it. */
const safeStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key).catch(() => null),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value).catch(() => undefined),
  removeItem: (key: string) => AsyncStorage.removeItem(key).catch(() => undefined),
};

type Draft = { areas: AreaId[]; goal: Goal; level: Level; days: DaysPerWeek; minutes: Minutes };
type Flags = { seenSave: boolean; seenPaywall: boolean; seenReminder: boolean };

type Data = {
  draft: Draft;
  plan: Plan | null;
  areaLevels: AreaLevels;
  history: CompletedSession[];
  /** The current one-off session (stiff-today or programme day). */
  extra: PlannedSession | null;
  account: Account | null;
  isPremium: boolean;
  reminder: Reminder | null;
  flags: Flags;
  programmeDays: Record<string, number>;
};

type Actions = {
  setDraft: (patch: Partial<Draft>) => void;
  createPlan: () => void;
  updatePlan: (patch: Partial<Pick<Plan, 'areas' | 'days' | 'minutes'>>) => void;
  recordSession: (session: PlannedSession, seconds: number, moves: number) => string;
  setFeedback: (recordId: string, feedback: Feedback) => void;
  startQuick: (area: AreaId) => PlannedSession | null;
  /** Keep a one-off session (such as an adjusted version of today's) so the player can open it. */
  startCustom: (session: PlannedSession) => void;
  startProgramme: (programmeId: string) => PlannedSession | null;
  setPremium: (value: boolean) => void;
  setAccount: (account: Account | null) => void;
  setReminder: (reminder: Reminder | null) => void;
  setFlag: (flag: keyof Flags) => void;
  reset: () => void;
};

export type AppState = Data & Actions;

const initialData: Data = {
  draft: { areas: ['lowerBack', 'hips'], goal: 'freely', level: 1, days: 4, minutes: 10 },
  plan: null,
  areaLevels: {},
  history: [],
  extra: null,
  account: null,
  isPremium: false,
  reminder: null,
  flags: { seenSave: false, seenPaywall: false, seenReminder: false },
  programmeDays: {},
};

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function clampLevel(n: number): Level {
  return Math.min(3, Math.max(1, n)) as Level;
}

function levelsFor(areas: AreaId[], existing: AreaLevels, fallback: Level): AreaLevels {
  const out: AreaLevels = {};
  for (const a of areas) out[a] = existing[a] ?? fallback;
  return out;
}

/** How much each answer moves the level: easy up, hard down, just right nowhere. */
const FEEDBACK_STEP: Record<Feedback, number> = { easy: 1, right: 0, hard: -1 };

/** Keeps reminders on the right days with the right titles after the plan changes. */
function syncReminders(plan: Plan, reminder: Reminder | null): void {
  if (reminder) scheduleReminders(plan, reminder).catch(() => undefined);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialData,

      setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),

      createPlan: () => {
        const { draft } = get();
        const levels = levelsFor(draft.areas, {}, draft.level);
        set({ plan: buildPlan({ ...draft, levels }), areaLevels: levels });
      },

      updatePlan: (patch) => {
        const { plan, areaLevels, reminder } = get();
        if (!plan) return;
        const next = { ...plan, ...patch, areas: sortAreas(patch.areas ?? plan.areas) };
        const levels = levelsFor(next.areas, areaLevels, plan.level);
        const updated = { ...next, sessions: generateSessions({ ...next, levels }) };
        set({
          plan: updated,
          areaLevels: { ...areaLevels, ...levels },
          draft: { ...get().draft, areas: next.areas, days: next.days, minutes: next.minutes },
        });
        syncReminders(updated, reminder);
      },

      recordSession: (session, seconds, moves) => {
        const id = newId();
        const first = getExercise(session.exerciseIds[0]);
        const record: CompletedSession = {
          id,
          sessionId: session.replaces ?? session.id,
          title: session.title,
          areas: session.areas,
          firstPose: first?.pose ?? 'child',
          date: new Date().toISOString(),
          seconds,
          moves,
        };
        set((s) => ({
          history: [record, ...s.history],
          programmeDays: session.programmeId
            ? { ...s.programmeDays, [session.programmeId]: (s.programmeDays[session.programmeId] ?? 0) + 1 }
            : s.programmeDays,
        }));
        return id;
      },

      setFeedback: (recordId, feedback) => {
        const { history, isPremium, plan, areaLevels } = get();
        const record = history.find((h) => h.id === recordId);
        if (!record || record.feedback === feedback) return;
        set({ history: history.map((h) => (h.id === recordId ? { ...h, feedback } : h)) });
        // Adaptive difficulty is a Premium feature: free users' feedback is stored only.
        if (!isPremium || !plan) return;
        // Changing an answer undoes the previous one first, so tapping around never stacks up.
        const step = FEEDBACK_STEP[feedback] - (record.feedback ? FEEDBACK_STEP[record.feedback] : 0);
        if (step === 0) return;
        const levels: AreaLevels = { ...areaLevels };
        for (const a of record.areas) levels[a] = clampLevel((levels[a] ?? plan.level) + step);
        set({ areaLevels: levels, plan: { ...plan, sessions: generateSessions({ ...plan, levels }) } });
      },

      startQuick: (area) => {
        const { plan, areaLevels } = get();
        if (!plan) return null;
        const session = makeQuickSession(area, plan, areaLevels);
        set({ extra: session });
        return session;
      },

      startCustom: (session) => set({ extra: session }),

      startProgramme: (programmeId) => {
        const { plan, areaLevels, programmeDays } = get();
        const programme = PROGRAMMES.find((p) => p.id === programmeId);
        if (!plan || !programme) return null;
        const day = Math.min(programme.days, (programmeDays[programmeId] ?? 0) + 1);
        const session = makeProgrammeSession(programme, day, plan, areaLevels);
        set({ extra: session });
        return session;
      },

      setPremium: (value) => set({ isPremium: value }),
      setAccount: (account) => set({ account }),
      setReminder: (reminder) => set({ reminder }),
      setFlag: (flag) => set((s) => ({ flags: { ...s.flags, [flag]: true } })),
      reset: () => set({ ...initialData }),
    }),
    {
      name: 'mobility-app',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (s): Data => ({
        draft: s.draft,
        plan: s.plan,
        areaLevels: s.areaLevels,
        history: s.history,
        extra: s.extra,
        account: s.account,
        isPremium: s.isPremium,
        reminder: s.reminder,
        flags: s.flags,
        programmeDays: s.programmeDays,
      }),
    },
  ),
);

/** Find a planned or one-off session by id. */
export function findSession(state: Pick<AppState, 'plan' | 'extra'>, id: string | undefined): PlannedSession | undefined {
  if (!id) return undefined;
  return state.plan?.sessions.find((s) => s.id === id) ?? (state.extra?.id === id ? state.extra : undefined);
}

/** True once saved data has loaded from the device. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, hasHydrated, () => false);
}

function subscribeHydration(onChange: () => void): () => void {
  return useAppStore.persist.onFinishHydration(() => onChange());
}

function hasHydrated(): boolean {
  return useAppStore.persist.hasHydrated();
}

import { create } from 'zustand';

/** Prototype: which look and layout the Today screen uses, so the team can compare them. Not saved between launches. */
export type LookChoice = 'current' | 'vision' | 'evening' | 'auto';
export type Look = Exclude<LookChoice, 'auto'>;
export type Layout = 'classic' | 'daily';
/** Daily layout stage; 'auto' follows the day (ask until you answer, done once you've trained). */
export type StageChoice = 'auto' | 'ask' | 'plan' | 'done';

type State = {
  choice: LookChoice;
  layout: Layout;
  stage: StageChoice;
  setChoice: (c: LookChoice) => void;
  setLayout: (l: Layout) => void;
  setStage: (s: StageChoice) => void;
};

export const useLook = create<State>((set) => ({
  choice: 'vision',
  layout: 'daily',
  stage: 'auto',
  setChoice: (choice) => set({ choice }),
  setLayout: (layout) => set({ layout }),
  setStage: (stage) => set({ stage }),
}));

/** Auto follows the day: the light look until 6 pm, the evening look after. */
export function resolveLook(choice: LookChoice, now: Date): Look {
  if (choice !== 'auto') return choice;
  const h = now.getHours();
  return h >= 18 || h < 6 ? 'evening' : 'vision';
}

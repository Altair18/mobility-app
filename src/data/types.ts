export type AreaId = 'neck' | 'shoulders' | 'elbows' | 'wrists' | 'upperBack' | 'lowerBack' | 'hips' | 'knees' | 'ankles' | 'feet';
export type BodyView = 'front' | 'back';

export type Goal = 'freely' | 'flexibility' | 'stiffness' | 'sport' | 'everyday';
/** 1 = new to mobility, 2 = some experience, 3 = trains it regularly. */
export type Level = 1 | 2 | 3;
export type DaysPerWeek = 2 | 3 | 4 | 5 | 7;
export type Minutes = 5 | 10 | 15 | 20;
export type Feedback = 'easy' | 'right' | 'hard';
export type Equipment = 'none' | 'mat' | 'wall';

export type PoseKey =
  | 'reach'
  | 'fold'
  | 'child'
  | 'cat'
  | 'lunge'
  | 'butterfly'
  | 'cobra'
  | 'hug'
  | 'seated'
  | 'neck'
  | 'chinTuck'
  | 'armCross'
  | 'goalpost'
  | 'sideBend'
  | 'thread'
  | 'twist'
  | 'bridge'
  | 'pigeon'
  | 'legSwing'
  | 'squat'
  | 'quad'
  | 'couch'
  | 'heelSit'
  | 'ankleRock'
  | 'downDog'
  | 'calf'
  | 'armsOut'
  | 'wristCircle'
  | 'prayer'
  | 'reversePrayer'
  | 'fingerPull'
  | 'forearmTurn'
  | 'wallArm'
  | 'tabletop'
  | 'footFlex'
  | 'calfRaise';

export type Exercise = {
  id: string;
  name: string;
  area: AreaId;
  level: Level;
  pose: PoseKey;
  /** Hold time. Doubled when `eachSide` is true. */
  seconds: number;
  eachSide: boolean;
  equipment: Equipment;
  goals: Goal[];
  /** One line shown in the session player. */
  tip: string;
  /** Short numbered steps shown on the exercise screen. */
  steps: string[];
};

export type SessionKind = 'mixed' | 'focus' | 'recovery' | 'quick' | 'programme';

export type PlannedSession = {
  id: string;
  /** 0 = Monday … 6 = Sunday */
  weekday: number;
  title: string;
  kind: SessionKind;
  areas: AreaId[];
  exerciseIds: string[];
  minutes: Minutes;
  programmeId?: string;
  /** For an adjusted version of a planned session: the planned session it stands in for, so finishing it counts. */
  replaces?: string;
};

export type Plan = {
  areas: AreaId[];
  goal: Goal;
  level: Level;
  days: DaysPerWeek;
  minutes: Minutes;
  sessions: PlannedSession[];
  createdAt: string;
};

export type CompletedSession = {
  id: string;
  sessionId: string;
  title: string;
  areas: AreaId[];
  firstPose: PoseKey;
  date: string;
  seconds: number;
  moves: number;
  feedback?: Feedback;
};

export type Account = {
  provider: 'apple' | 'email';
  id: string;
  email?: string;
  name?: string;
};

export type ReminderSlot = 'morning' | 'afternoon' | 'evening' | 'custom';
export type Reminder = { slot: ReminderSlot; hour: number; minute: number };

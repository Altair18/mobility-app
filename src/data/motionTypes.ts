export type Pt = [number, number];

/** One frame of the exercise figure: joint positions in a 100 × 100 box (floor at y = 85). */
export type Pose = {
  /** Side view faces right; front view faces the viewer. */
  view: 'side' | 'front';
  hip: Pt;
  /** Top of the torso, where the arms attach. */
  sh: Pt;
  /** Head centre. */
  head: Pt;
  /** Near arm: elbow, hand. */
  armF: [Pt, Pt];
  /** Far arm: elbow, hand. */
  armB: [Pt, Pt];
  /** Near leg: knee, ankle, toes. */
  legF: [Pt, Pt, Pt];
  legB: [Pt, Pt, Pt];
  /** Optional extra hand point past the wrist (wrist circles, flexor stretch). */
  handF?: Pt;
  handB?: Pt;
  /** Curve of the torso: positive bulges towards the back. */
  spine?: number;
  /** Front view only: where a small dot sits on the face (degrees, 0 = viewer's right), to show the head turning. */
  nose?: number;
  mat?: boolean;
  /** x of a wall line. */
  wall?: number;
  /** Arms are behind the body. */
  behind?: boolean;
};

export type Motion = {
  frames: Pose[];
  /** Seconds for one full loop. */
  period: number;
  /** pingpong: first → last → first. cycle: through every frame and round again. */
  loop: 'pingpong' | 'cycle';
  /** Fraction of a pingpong loop to pause at each end. */
  hold: number;
};
